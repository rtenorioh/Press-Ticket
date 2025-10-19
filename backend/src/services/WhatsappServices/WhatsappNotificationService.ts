import WhatsappNotification from "../../models/WhatsappNotification";
import Whatsapp from "../../models/Whatsapp";
import NotifyAdminsService from "./NotifyAdminsService";

interface Request {
  whatsappId: number;
}

interface CheckNotificationResult {
  shouldNotify: boolean;
  lastNotificationTime: Date | null;
}

export const checkAndUpdateNotificationTime = async ({ whatsappId }: Request): Promise<CheckNotificationResult> => {
  let notification = await WhatsappNotification.findOne({
    where: { whatsappId }
  });

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); 

  if (!notification) {
    notification = await WhatsappNotification.create({
      whatsappId,
      lastNotificationTime: now
    });
    
    return { shouldNotify: true, lastNotificationTime: now };
  }

  const shouldNotify = new Date(notification.lastNotificationTime) < thirtyMinutesAgo;

  if (shouldNotify) {
    await notification.update({ lastNotificationTime: now });
    return { shouldNotify: true, lastNotificationTime: now };
  }

  return { 
    shouldNotify: false, 
    lastNotificationTime: notification.lastNotificationTime 
  };
};

export const notifyIfNeeded = async ({ whatsappId }: Request): Promise<boolean> => {
  const { shouldNotify } = await checkAndUpdateNotificationTime({ whatsappId });
  
  if (shouldNotify) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (whatsapp && whatsapp.status !== "CONNECTED") {
      await NotifyAdminsService({ whatsappId });
      return true;
    }
  }
  
  return false;
};

export default {
  checkAndUpdateNotificationTime,
  notifyIfNeeded
};
