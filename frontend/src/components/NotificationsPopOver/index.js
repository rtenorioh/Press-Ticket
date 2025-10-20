import {
	Badge,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Popover,
	Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChatIcon from "@mui/icons-material/Chat";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { format } from "date-fns";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useSound from "use-sound";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { getImageUrl } from "../../helpers/imageHelper";
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import TicketListItem from "../TicketListItem";

const TabContainer = styled('div')(({ theme }) => ({
	overflowY: "auto",
	maxHeight: 350,
	...(theme.scrollbarStyles || {}),
}));

const PopoverPaper = styled(Popover)(({ theme }) => ({
	'& .MuiPopover-paper': {
		width: "100%",
		maxWidth: 350,
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(1),
		[theme.breakpoints.down("sm")]: {
			maxWidth: 270,
		},
	}
}));

const NotificationsPopOver = () => {
	const themeStorage = localStorage.getItem("theme");
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useContext(AuthContext);
	const ticketIdUrl = +location.pathname.split("/")[2];
	const anchorEl = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [isAudioEnabled, setIsAudioEnabled] = useState(
		localStorage.getItem("userAudioEnabled") === "true"
	);
	const [notificationsAllowed, setNotificationsAllowed] = useState(
		Notification.permission === "granted"
	);
	const { tickets } = useTickets({ withUnreadMessages: "true", all: true });
	const [play, { stop }] = useSound(alertSound, { soundEnabled: isAudioEnabled });
	const soundAlertRef = useRef(play);

	useEffect(() => {
		soundAlertRef.current = play;
	}, [play]);

	useEffect(() => {
		setNotifications((tickets || []).filter(t => t.status !== "closed"));
	}, [tickets]);

	const requestNotificationPermission = () => {
		if (!("Notification" in window)) {
			alert(t("notifications.unsupported"));
			return;
		}
		
		Notification.requestPermission()
			.then((permission) => {
				if (permission === "granted") {
					setNotificationsAllowed(true);
					toast.success(t("notifications.permissionGranted"));
				} else if (permission === "denied") {
					toast.error(t("notifications.permissionDenied"));
				}
			})
			.catch((error) => {
				console.error("Erro ao solicitar permissão para notificações:", error);
				toast.error(t("notifications.error"));
			});
	};

	const handleNotifications = useCallback(
		(data) => {

			if (!notificationsAllowed) {
				console.warn("[NOTIFICAÇÃO] Notificações não permitidas pelo navegador");
				return;
			}

			const { message, contact, ticket } = data;

			const options = {
				body: `${message.body} - ${format(new Date(), "HH:mm")}`,
				icon: contact.profilePicUrl,
				tag: ticket.id,
				renotify: true,
			};

			try {
				const notification = new Notification(
					`${t("tickets.notification.message")} ${contact.name}`,
					options
				);

				notification.onclick = (e) => {
					e.preventDefault();
					window.focus();
					navigate(`/tickets/${ticket.id}`);
				};

			} catch (error) {
				console.error("[NOTIFICAÇÃO] Erro ao exibir notificação:", error);
			}

			if (isAudioEnabled && soundAlertRef.current) {
				soundAlertRef.current();
			}
		},
		[isAudioEnabled, navigate, notificationsAllowed, t]
	);

	useEffect(() => {
		const socket = openSocket();

		socket.on("connect", () => {
			socket.emit("joinNotification");
		});

		socket.on("appMessage", (data) => {
			if (!data.ticket) {
				return;
			}
			
			const UserQueues = user?.queues?.findIndex(	
				(users) => users.id === data.ticket.queueId
			);

			const isAdminUser = user?.profile === "admin" || user?.profile === "masteradmin";

			const isUserQueue = UserQueues !== -1 || !data.ticket.queueId;
		
			const shouldNotifyOpenTicket = data.ticket.status === "open" && 
				(data.ticket.userId === user?.id || isAdminUser);
			
			const shouldNotifyPendingTicket = data.ticket.status === "pending" && 
				(!data.ticket.userId && (isUserQueue || isAdminUser));

			if (
				data.action === "create" &&
				!data.message.read &&
				(shouldNotifyOpenTicket || shouldNotifyPendingTicket)
			) {
				if (data.ticket.status === "closed") {
					setNotifications((prevState) => prevState.filter((t) => t.id !== data.ticket.id));
					return;
				}
				setNotifications((prevState) => {
					const ticketIndex = prevState.findIndex((t) => t.id === data.ticket.id);
					if (ticketIndex !== -1) {
						prevState[ticketIndex] = data.ticket;
						return [...prevState.filter(t => t.status !== "closed")];
					}
					return [data.ticket, ...prevState].filter(t => t.status !== "closed");
				});

				const shouldNotNotify = data.message.ticketId === ticketIdUrl && document.visibilityState === "visible";

				if (shouldNotNotify) {
					console.warn("[NOTIFICAÇÃO] Notificação bloqueada - ticket já está aberto na tela");
					return;
				}

				handleNotifications(data);
			} else {
				console.warn("[NOTIFICAÇÃO] Condições NÃO atendidas:", {
					isCreate: data.action === "create",
					isUnread: !data.message.read,
					ticketStatus: data.ticket.status,
					shouldNotifyOpenTicket: data.ticket.status === "open" && (data.ticket.userId === user?.id || isAdminUser),
					shouldNotifyPendingTicket: data.ticket.status === "pending" && (!data.ticket.userId && (isUserQueue || isAdminUser)),
					isAdminUser,
					ticketUserId: data.ticket.userId,
					currentUserId: user?.id
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user, ticketIdUrl, handleNotifications]);

	useEffect(() => {
		const updateDocumentTitle = async () => {
			try {
				const { data } = await api.get("/personalizations");
				let baseTitle = "Press Ticket®";
				let faviconUrl =
					"https://github.com/rtenorioh/Press-Ticket/blob/main/frontend/public/favicon.ico?raw=true";
				if (data && data.length > 0) {
					const lightConfig = data.find((config) => config.theme === "light");
					const darkConfig = data.find((config) => config.theme === "dark");

					if (themeStorage === "light" && lightConfig) {
						faviconUrl = lightConfig.favico || faviconUrl;
						baseTitle = lightConfig.company || baseTitle;
					} else if (themeStorage === "dark" && darkConfig) {
						faviconUrl = darkConfig.favico || faviconUrl;
					}
				}
				document.title =
					notifications.length > 0
						? `(${notifications.length}) ${baseTitle}`
						: baseTitle;

				let link = document.querySelector("link[rel~='icon']");
				if (!link) {
					link = document.createElement("link");
					link.rel = "icon";
					document.getElementsByTagName("head")[0].appendChild(link);
				}
				link.href = getImageUrl(faviconUrl);
			} catch (err) {
				toastError(err, t);
				document.title = "Erro ao carregar título";
			}
		};

		updateDocumentTitle();
	}, [notifications, themeStorage, t]);

	const toggleAudio = () => {
		const newAudioStatus = !isAudioEnabled;
		setIsAudioEnabled(newAudioStatus);
		localStorage.setItem("userAudioEnabled", newAudioStatus.toString());

		if (!newAudioStatus) {
			stop();
		}
	};

	const handleClick = () => {
		setIsOpen((prevState) => !prevState);
	};

	const handleClickAway = () => {
		setIsOpen(false);
	};

	const NotificationTicket = ({ children }) => (
		<div onClick={handleClickAway}>{children}</div>
	);

	return (
		<>
			<IconButton onClick={toggleAudio} aria-label="Toggle Sound" color="inherit">
				{isAudioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
			</IconButton>
			{!notificationsAllowed && (
				<IconButton
					onClick={requestNotificationPermission}
					color="inherit"
					variant="contained"
				>
					<Tooltip title={t("notifications.allow")} arrow>
						<HelpOutlineIcon />
					</Tooltip>
				</IconButton>
			)}
			<IconButton
				onClick={handleClick}
				ref={anchorEl}
				aria-label="Open Notifications"
				color="inherit"
			>
				<Badge
					badgeContent={notifications.length}
					color="secondary"
					overlap="rectangular"
					max={999999}
				>
					<ChatIcon />
				</Badge>
			</IconButton>
			<PopoverPaper
				disableScrollLock
				open={isOpen}
				anchorEl={anchorEl.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				onClose={handleClickAway}
			>
				<List dense component={TabContainer}>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText>{t("notifications.noTickets")}</ListItemText>
						</ListItem>
					) : (
						notifications.map((ticket) => (
							<NotificationTicket key={ticket.id}>
								<TicketListItem ticket={ticket} />
							</NotificationTicket>
						))
					)}
				</List>
			</PopoverPaper>
		</>
	);
};

export default NotificationsPopOver;
