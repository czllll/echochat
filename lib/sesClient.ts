import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
// Set the AWS Region.
// Create SES service object.
const sesClient = new SESClient({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export  const sendEmail = async(
    toAddress: string,
    fromAddress: string,
    subject: string,
    htmlBody: string,
    textBody: string,
) => {
    const params = {
        Source: fromAddress,
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
                Html: { Data: htmlBody, Charset: "UTF-8" },
                Text: { Data: textBody, Charset: "UTF-8" },
            },
        },
    };
    const command = new SendEmailCommand(params);

    try {
        const response = await sesClient.send(command);
        console.log("Email sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }

}

export { sesClient };
