"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Metadata } from "next"

// Define metadata as a variable, not as an export
const metadata: Metadata = {
  title: "Messaging Setup | Admin Dashboard | Casa Alpaca",
  description: "Set up messaging for your Casa Alpaca vacation rental"
}

// Export metadata using Next.js specific function
export { metadata }

export default async function MessagingSetupPage() {
  return (
    <div className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Messaging Setup</h1>
        <Link
          href="/admin/messaging"
          className="text-sm text-blue-500 hover:underline"
        >
          Back to Messaging
        </Link>
      </div>

      <Tabs defaultValue="twilio">
        <TabsList className="mb-4">
          <TabsTrigger value="twilio">Twilio SMS Setup</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="twilio">
          <Card>
            <CardHeader>
              <CardTitle>Setting up Twilio SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Follow these steps to set up Twilio SMS messaging for your
                vacation rental:
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    1. Create a Twilio Account
                  </h3>
                  <p>
                    Visit{" "}
                    <a
                      href="https://www.twilio.com/try-twilio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Twilio's website
                    </a>{" "}
                    and sign up for an account if you don't have one already.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    2. Get a Twilio Phone Number
                  </h3>
                  <p>
                    Once your account is set up, purchase a Twilio phone number
                    with SMS capabilities. For US clients, we recommend using a
                    US number.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    3. Find Your Account SID and Auth Token
                  </h3>
                  <p>
                    From your Twilio Dashboard, locate your Account SID and Auth
                    Token. You'll need these to authenticate your API requests.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    4. Update Your Environment Variables
                  </h3>
                  <p>Add the following variables to your .env.local file:</p>
                  <pre className="bg-muted overflow-auto rounded-lg p-4 text-sm">
                    <code>
                      TWILIO_ACCOUNT_SID=your_account_sid{"\n"}
                      TWILIO_AUTH_TOKEN=your_auth_token{"\n"}
                      TWILIO_PHONE_NUMBER=your_twilio_phone_number{"\n"}
                    </code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    5. Set Up Webhooks (Optional)
                  </h3>
                  <p>
                    To receive incoming SMS and delivery status updates, set up
                    webhooks in your Twilio console:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>
                      Go to Phone Numbers &gt; Manage &gt; Active Numbers &gt;
                      Select your number
                    </li>
                    <li>
                      Under Messaging, set the webhook URL to:{" "}
                      <code className="bg-muted rounded px-1">
                        https://yourdomain.com/api/twilio/webhook
                      </code>
                    </li>
                    <li>Make sure HTTP POST is selected</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    6. Test Your Integration
                  </h3>
                  <p>
                    Go to the Messaging section in your admin dashboard and test
                    sending an SMS to your phone number.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Setting up WhatsApp Business API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Follow these steps to set up WhatsApp Business API messaging for
                international clients:
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    1. Create a Meta for Developers Account
                  </h3>
                  <p>
                    Visit{" "}
                    <a
                      href="https://developers.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Meta for Developers
                    </a>{" "}
                    and create an account.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    2. Create a Meta App
                  </h3>
                  <p>
                    Create a new app in the Meta for Developers portal and
                    select "Business" as the app type.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">3. Set Up WhatsApp</h3>
                  <p>
                    Add the WhatsApp product to your app, and follow the setup
                    instructions. You'll need to:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Link a Facebook Business Account</li>
                    <li>Add a WhatsApp Business Account</li>
                    <li>Set up a phone number for WhatsApp Business API</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    4. Get Required Details for Integration
                  </h3>
                  <p>From your WhatsApp Business API setup, you'll need:</p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Phone Number ID</li>
                    <li>WhatsApp Access Token</li>
                    <li>Generate a Webhook Verify Token (any random string)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    5. Update Your Environment Variables
                  </h3>
                  <p>Add the following variables to your .env.local file:</p>
                  <pre className="bg-muted overflow-auto rounded-lg p-4 text-sm">
                    <code>
                      WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id{"\n"}
                      WHATSAPP_ACCESS_TOKEN=your_access_token{"\n"}
                      WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token{"\n"}
                    </code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    6. Configure Webhooks
                  </h3>
                  <p>
                    In the WhatsApp Business Platform settings, configure
                    webhooks:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>
                      Set Callback URL to:{" "}
                      <code className="bg-muted rounded px-1">
                        https://yourdomain.com/api/whatsapp/webhook
                      </code>
                    </li>
                    <li>Use your Webhook Verify Token from step 4</li>
                    <li>
                      Subscribe to the messages and message_status webhook
                      fields
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    7. Test Your Integration
                  </h3>
                  <p>
                    Go to the Messaging section in your admin dashboard, select
                    WhatsApp as the message type, and test sending a message to
                    your phone number.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
