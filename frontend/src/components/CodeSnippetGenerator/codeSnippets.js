const codeSnippets = {
    HTTP: (number, body, userId, queueId, whatsappId, token) => `POST ${process.env.REACT_APP_BACKEND_URL}/api/messages/send HTTP/1.1
User-Agent: vscode-restclient
Authorization: Bearer ${token}
Content-Type: application/json
Host: localhost:4000
Content-Length: ${85 + body.length}

{
            "number": "${number}",
            "body": "${body}",
            "userId": "${userId}",
            "queueId": "${queueId}",
            "whatsappId": "${whatsappId}"
        }`,
    JavaScript_JQuery: (number, body, userId, queueId, whatsappId, token) => `const settings = {
  "async": true,
  "crossDomain": true,
  "url": "${process.env.REACT_APP_BACKEND_URL}/api/messages/send}",
  "method": "POST",
  "headers": {
    "user-agent": "vscode-restclient",
    "authorization": "Bearer ${token}",
    "content-type": "application/json"
  },
  "processData": false,
  "data": "{\"number\": \"${number}\",\"body\": \"${body}\",\"userId\": \"${userId}\",\"queueId\": \"${queueId}\",\"whatsappId\": \"${whatsappId}\"}"
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
        `,
    JavaScript_fetch: (number, body, userId, queueId, whatsappId, token) => `
        fetch("${process.env.REACT_APP_BACKEND_URL}/api/messages/send", {
            "method": "POST",
            "headers": {
                "user-agent": "vscode-restclient",
                "Content-Type": "application/json",
                "Authorization": "Bearer ${token}",
            },
            "body": {
                number: "${number}",
                body: '${body}',
                userId: '${userId}',
                queueId: '${queueId}',
                whatsAppId: '${whatsappId}'
            },
        })
        .then(response => {
  console.log(response);
})
.catch(err => {
  console.error(err);
});
        `,
    NODEjs_Request: (number, body, userId, queueId, whatsappId, token) => `
        const request = require('request');
        const options = {
            method: 'POST',
            url: '${process.env.REACT_APP_BACKEND_URL}/api/messages/send',
            headers: {
                'user-agent': 'vscode-restclient',
                'Authorization': 'Bearer ${token}',
                'Content-Type': 'application/json',
            },
            body: {
                number: '${number}',
                body: '${body}',
                userId: '${userId}',
                queueId: '${queueId}',
                whatsAppId: '${whatsappId}',
            },
            json: true
        };
        
        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log('Response:', body);
        });`,
    PHP_cURL: (number, body, userId, queueId, whatsappId, token) => `
        <?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_PORT => "4000",
  CURLOPT_URL => "${process.env.REACT_APP_BACKEND_URL}/api/messages/send",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\"number\": \"${number}\",\"body\": \"${body}\",\"userId\": \"${userId}\",\"queueId\": \"${queueId}\",\"whatsappId\": \"${whatsappId}\"}",
  CURLOPT_HTTPHEADER => [
    'Authorization': 'Bearer ${token}',
    "content-type: application/json",
    "user-agent: vscode-restclient"
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}

        `,
};

export default codeSnippets;