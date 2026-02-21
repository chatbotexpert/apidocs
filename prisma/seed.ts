import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to safely upsert a parameter (avoids the id:0 anti-pattern)
async function upsertParam(endpointId: number, name: string, type: string, location: string, isRequired: boolean, description: string) {
    const existing = await prisma.parameter.findFirst({ where: { endpointId, name } });
    if (existing) return existing;
    return prisma.parameter.create({ data: { endpointId, name, type, location, isRequired, description } });
}

async function upsertEndpoint(platformId: number, path: string, method: string, summary: string, description: string, category: string) {
    return prisma.endpoint.upsert({
        where: { platformId_path_method: { platformId, path, method } },
        create: { platformId, path, method, summary, description, category },
        update: { summary, description, category },
    });
}

async function main() {
    // ════════════════════════════════════════════
    // PLATFORMS
    // ════════════════════════════════════════════
    const encompass = await prisma.platform.upsert({
        where: { name: "Encompass LOS" },
        create: { name: "Encompass LOS", baseUrl: "https://api.elliemae.com", authType: "OAuth2" },
        update: {},
    });

    const msgraph = await prisma.platform.upsert({
        where: { name: "Microsoft Graph" },
        create: { name: "Microsoft Graph", baseUrl: "https://graph.microsoft.com/v1.0", authType: "OAuth2 (Azure AD)" },
        update: {},
    });

    const google = await prisma.platform.upsert({
        where: { name: "Google Workspace" },
        create: { name: "Google Workspace", baseUrl: "https://www.googleapis.com", authType: "OAuth2 (Google)" },
        update: {},
    });

    const stripe = await prisma.platform.upsert({
        where: { name: "Stripe" },
        create: { name: "Stripe", baseUrl: "https://api.stripe.com/v1", authType: "Bearer Token (Secret Key)" },
        update: {},
    });

    const twilio = await prisma.platform.upsert({
        where: { name: "Twilio" },
        create: { name: "Twilio", baseUrl: "https://api.twilio.com/2010-04-01", authType: "HTTP Basic (Account SID + Auth Token)" },
        update: {},
    });

    const salesforce = await prisma.platform.upsert({
        where: { name: "Salesforce" },
        create: { name: "Salesforce", baseUrl: "https://{instance}.salesforce.com/services/data/v58.0", authType: "OAuth2" },
        update: {},
    });

    const slack = await prisma.platform.upsert({
        where: { name: "Slack" },
        create: { name: "Slack", baseUrl: "https://slack.com/api", authType: "Bearer Token (Bot Token)" },
        update: {},
    });

    const github = await prisma.platform.upsert({
        where: { name: "GitHub" },
        create: { name: "GitHub", baseUrl: "https://api.github.com", authType: "Bearer Token (PAT)" },
        update: {},
    });

    const sendgrid = await prisma.platform.upsert({
        where: { name: "SendGrid" },
        create: { name: "SendGrid", baseUrl: "https://api.sendgrid.com/v3", authType: "Bearer Token (API Key)" },
        update: {},
    });

    const hubspot = await prisma.platform.upsert({
        where: { name: "HubSpot" },
        create: { name: "HubSpot", baseUrl: "https://api.hubapi.com", authType: "OAuth2 / Private App Token" },
        update: {},
    });

    const openai = await prisma.platform.upsert({
        where: { name: "OpenAI" },
        create: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", authType: "Bearer Token (API Key)" },
        update: {},
    });

    const aws_s3 = await prisma.platform.upsert({
        where: { name: "AWS S3" },
        create: { name: "AWS S3", baseUrl: "https://s3.amazonaws.com", authType: "AWS Signature v4" },
        update: {},
    });

    const plaid = await prisma.platform.upsert({
        where: { name: "Plaid" },
        create: { name: "Plaid", baseUrl: "https://production.plaid.com", authType: "Client ID + Secret" },
        update: {},
    });

    const zendesk = await prisma.platform.upsert({
        where: { name: "Zendesk" },
        create: { name: "Zendesk", baseUrl: "https://{subdomain}.zendesk.com/api/v2", authType: "OAuth2 / API Token" },
        update: {},
    });

    const shopify = await prisma.platform.upsert({
        where: { name: "Shopify Admin" },
        create: { name: "Shopify Admin", baseUrl: "https://{store}.myshopify.com/admin/api/2024-01", authType: "OAuth2 / Access Token" },
        update: {},
    });

    const docusign = await prisma.platform.upsert({
        where: { name: "DocuSign" },
        create: { name: "DocuSign", baseUrl: "https://www.docusign.net/restapi/v2.1", authType: "OAuth2 (JWT / Auth Code)" },
        update: {},
    });

    // ════════════════════════════════════════════
    // ENCOMPASS LOS
    // ════════════════════════════════════════════
    const loanGet = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}", "GET", "Get Loan Details",
        "Retrieves the complete loan object for a given Loan GUID. Returns all loan fields including borrower, property, and financial data.", "Loans");

    await upsertEndpointGuide(loanGet.id, `
# Reading Loans in Encompass API
The \`GET /encompass/v3/loans/{loanId}\` endpoint is the workhorse of the Encompass API. It pulls a massive JSON object representing everything from the borrower's name to the rate lock status.

## Common Use Cases
*   **Syncing to a CRM:** Polling for loan updates and mapping standard fields (e.g. \`4000\` - Borrower First Name) into Salesforce or HubSpot.
*   **Generating Disclosures:** Extracting rate and fee data to populate custom PDF documents.
*   **Underwriting Assistants:** Feeding loan data into an AI model for preliminary review.

## Managing the Payload Size
A full Encompass loan can be **huge** (sometimes exceeding 10MB of JSON). 
> [!TIP]
> Use the \`entities\` parameter to significantly speed up your requests! Instead of downloading the whole loan, you can ask for just the custom fields, or just the contacts.

### Entities Example
\`\`\`bash
curl -X GET "https://api.elliemae.com/encompass/v3/loans/{loanId}?entities=contacts,customFields" \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`
`);

    const loanPatch = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}", "PATCH", "Update Loan Fields",
        "Partially updates a loan's field values. Only the fields provided in the request body will be modified.", "Loans");
    const loanCreate = await upsertEndpoint(encompass.id, "/encompass/v3/loans", "POST", "Create New Loan",
        "Creates a new loan in Encompass. Returns the newly created loan's GUID.", "Loans");

    await upsertEndpointGuide(loanCreate.id, `
# Creating Loans in Encompass
Creating a loan via the v3 API is generally straightforward, but requires understanding how Encompass structures its data model.

## Essential Fields
While technically you can create a blank loan, you almost always want to provide a few basics. Encompass fields are addressed by their **Field ID** (e.g., \`4000\`, \`4004\`, \`11\`).

> [!CAUTION]
> Creating a loan **will trigger business rules** in Encompass. If you have field triggers or milestone rules set up on loan creation, they will fire immediately upon this API call.

## Standard Payload Example
Here is the minimal JSON structure recommended when creating a new lead:

\`\`\`json
{
  "borrowerPairs": [
    {
      "borrower": {
        "firstName": "Jane",
        "lastName": "Doe",
        "emailAddressText": "jane.doe@example.com",
        "homePhoneNumber": "555-555-1234"
      }
    }
  ],
  "loanAmount": 350000,
  "applications": [
    {
      "propertyUsageType": "PrimaryResidence",
      "propertyState": "CA"
    }
  ]
}
\`\`\`
`);

    const loanDelete = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}", "DELETE", "Delete Loan",
        "Permanently removes a loan from Encompass. Requires special administrative permissions.", "Loans");
    const loanPipeline = await upsertEndpoint(encompass.id, "/encompass/v3/loanPipeline", "POST", "Search Loan Pipeline",
        "Searches the loan pipeline based on provided filter criteria. Can retrieve specific fields like GUID, Loan Number, and Borrower Name.", "Loans");

    const tokenPost = await upsertEndpoint(encompass.id, "/oauth2/v1/token", "POST", "Request OAuth2 Token",
        "Authenticates with the Encompass API and returns a bearer token. Requires client credentials and an instance ID.", "Authentication");
    const tokenIntrospect = await upsertEndpoint(encompass.id, "/oauth2/v1/token/introspection", "POST", "Introspect Token",
        "Verifies the validity and returns metadata associated with an OAuth2 token.", "Authentication");

    const docPost = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/attachments", "POST", "Upload Loan Attachment",
        "Uploads a document attachment (e.g., PDF, image) directly to the eFolder of a specific loan.", "eFolder / Documents");
    const docGet = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/documents", "GET", "Get Loan Documents",
        "Retrieves a list of all documents (placeholders and attachments) currently in the loan's eFolder.", "eFolder / Documents");
    const docCreate = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/documents", "POST", "Create Document Placeholder",
        "Creates a new document placeholder in the loan's eFolder, ready to have attachments assigned to it.", "eFolder / Documents");

    const borrowerContactsGet = await upsertEndpoint(encompass.id, "/encompass/v3/borrowerContacts", "GET", "List Borrower Contacts",
        "Retrieves a paginated list of borrower contacts from the Encompass database.", "Contacts");
    const bizContactsGet = await upsertEndpoint(encompass.id, "/encompass/v3/businessContacts", "GET", "List Business Contacts",
        "Retrieves a paginated list of business contacts (e.g., Realtors, Appraisers).", "Contacts");

    const cdoGet = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/customDataObjects", "GET", "List Custom Data Objects (CDOs)",
        "Retrieves all Custom Data Objects (CDOs) associated with a specific loan.", "Custom Data Objects");
    const cdoPut = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/customDataObjects/{objectName}", "PUT", "Create/Update CDO",
        "Creates or updates a Custom Data Object (CDO) file stored on the loan. The body payload is stored as a base-64 encoded file.", "Custom Data Objects");

    const webhookCreate = await upsertEndpoint(encompass.id, "/encompass/v3/subscriptions", "POST", "Create Webhook Subscription",
        "Creates a new event subscription (Webhook). Receive real-time notifications when loan data changes or milestones are completed.", "Webhooks");

    const healthEncompass = await upsertEndpoint(encompass.id, "/encompass/v3/settings/systemConfiguration", "GET", "Health Check",
        "Returns current system configuration settings. Useful as a connectivity/auth check.", "Settings");

    async function upsertEndpointGuide(endpointId: number, markdown: string) {
        const existing = await prisma.endpointGuide.findUnique({ where: { endpointId } });
        if (existing) {
            return prisma.endpointGuide.update({ where: { id: existing.id }, data: { markdown } });
        }
        return prisma.endpointGuide.create({ data: { endpointId, markdown } });
    }

    // ════════════════════════════════════════════
    // MICROSOFT GRAPH
    // ════════════════════════════════════════════
    const meGet = await upsertEndpoint(msgraph.id, "/me", "GET", "Get Current User Profile",
        "Returns the profile of the signed-in user including display name, email, and directory information.", "Users");
    const usersGet = await upsertEndpoint(msgraph.id, "/users", "GET", "List All Users",
        "Returns a list of user objects in the organization. Requires User.Read.All or Directory.Read.All permission.", "Users");
    const sendMail = await upsertEndpoint(msgraph.id, "/users/{userId}/sendMail", "POST", "Send Email",
        "Sends an email message on behalf of the specified user. Requires Mail.Send permission.", "Mail");
    const calendarEvents = await upsertEndpoint(msgraph.id, "/me/events", "GET", "List Calendar Events",
        "Returns a list of events from the signed-in user's default calendar.", "Calendar");
    const createEvent = await upsertEndpoint(msgraph.id, "/me/events", "POST", "Create Calendar Event",
        "Creates a new event in the signed-in user's default calendar.", "Calendar");
    const teamsMessage = await upsertEndpoint(msgraph.id, "/teams/{teamId}/channels/{channelId}/messages", "POST", "Send Teams Channel Message",
        "Sends a message to a Microsoft Teams channel. Requires ChannelMessage.Send permission.", "Teams");
    const oneDriveFiles = await upsertEndpoint(msgraph.id, "/me/drive/root/children", "GET", "List OneDrive Files",
        "Lists the children (files and folders) in the root of the signed-in user's OneDrive.", "OneDrive");

    // ════════════════════════════════════════════
    // GOOGLE WORKSPACE
    // ════════════════════════════════════════════
    const gmailList = await upsertEndpoint(google.id, "/gmail/v1/users/{userId}/messages", "GET", "List Gmail Messages",
        "Lists messages in the user's mailbox. Use query parameters to filter by label, date, or search query.", "Gmail");
    const gmailSend = await upsertEndpoint(google.id, "/gmail/v1/users/{userId}/messages/send", "POST", "Send Gmail Message",
        "Sends an email via the authenticated user's Gmail account. Body must be base64url-encoded RFC 2822 message.", "Gmail");
    const driveList = await upsertEndpoint(google.id, "/drive/v3/files", "GET", "List Drive Files",
        "Lists or searches files and folders in the user's Google Drive.", "Drive");
    const driveUpload = await upsertEndpoint(google.id, "/upload/drive/v3/files", "POST", "Upload File to Drive",
        "Uploads a new file to the user's Google Drive. Supports multipart and resumable upload.", "Drive");
    const sheetsRead = await upsertEndpoint(google.id, "/v4/spreadsheets/{spreadsheetId}/values/{range}", "GET", "Read Spreadsheet Values",
        "Returns a range of values from a Google Sheets spreadsheet.", "Sheets");
    const sheetsWrite = await upsertEndpoint(google.id, "/v4/spreadsheets/{spreadsheetId}/values/{range}:append", "POST", "Append Spreadsheet Values",
        "Appends values to a spreadsheet. The input range is used to search for existing data.", "Sheets");
    const calendarList = await upsertEndpoint(google.id, "/calendar/v3/calendars/{calendarId}/events", "GET", "List Calendar Events",
        "Returns events on the specified calendar. Use timeMin/timeMax to limit the range.", "Calendar");

    // ════════════════════════════════════════════
    // STRIPE
    // ════════════════════════════════════════════
    await upsertEndpoint(stripe.id, "/customers", "POST", "Create Customer",
        "Creates a new customer object. Customers let you track and link payments and subscriptions.", "Customers");
    await upsertEndpoint(stripe.id, "/customers/{id}", "GET", "Retrieve Customer",
        "Retrieves the details of an existing customer given their ID.", "Customers");
    await upsertEndpoint(stripe.id, "/customers", "GET", "List All Customers",
        "Returns a list of your customers. Customers are sorted by creation date, with most recent first.", "Customers");
    await upsertEndpoint(stripe.id, "/payment_intents", "POST", "Create Payment Intent",
        "Creates a PaymentIntent object. Use the returned client_secret with Stripe.js to complete payment on the client side.", "Payments");
    await upsertEndpoint(stripe.id, "/payment_intents/{intent}/confirm", "POST", "Confirm Payment Intent",
        "Confirm that your customer intends to pay with the collected payment method.", "Payments");
    await upsertEndpoint(stripe.id, "/refunds", "POST", "Create Refund",
        "Creates a refund for a previously created payment. You can refund the full charge or a partial amount.", "Refunds");
    await upsertEndpoint(stripe.id, "/subscriptions", "POST", "Create Subscription",
        "Creates a new subscription on an existing customer. Requires a customer ID and at least one price.", "Subscriptions");
    await upsertEndpoint(stripe.id, "/subscriptions/{subscriptionId}", "DELETE", "Cancel Subscription",
        "Cancels a customer's subscription immediately or at period end.", "Subscriptions");
    await upsertEndpoint(stripe.id, "/invoices/{invoice}", "GET", "Retrieve Invoice",
        "Retrieves the invoice with the given ID.", "Invoices");
    await upsertEndpoint(stripe.id, "/webhooks/endpoints", "POST", "Create Webhook Endpoint",
        "Creates a new webhook endpoint to receive live events from Stripe.", "Webhooks");

    // ════════════════════════════════════════════
    // TWILIO
    // ════════════════════════════════════════════
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/Messages.json", "POST", "Send SMS Message",
        "Sends an SMS or MMS message from a Twilio phone number to a destination number.", "Messages");
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/Messages.json", "GET", "List Messages",
        "Returns a list of messages associated with your account, sorted newest first.", "Messages");
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/Calls.json", "POST", "Create Call",
        "Creates an outbound call from a Twilio phone number. Provide a TwiML URL or TwiML instructions.", "Calls");
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/Calls/{CallSid}.json", "GET", "Get Call Details",
        "Returns the call resource for a specific call identified by the CallSid.", "Calls");
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/IncomingPhoneNumbers.json", "GET", "List Phone Numbers",
        "Returns a list of phone numbers currently available to your Twilio account.", "Phone Numbers");
    await upsertEndpoint(twilio.id, "/Accounts/{AccountSid}/Recordings.json", "GET", "List Recordings",
        "Returns a list of recordings associated with your account.", "Recordings");

    // ════════════════════════════════════════════
    // SALESFORCE
    // ════════════════════════════════════════════
    await upsertEndpoint(salesforce.id, "/sobjects/{sObjectType}", "POST", "Create Record",
        "Creates a new record of the specified Salesforce object type (e.g., Account, Lead, Contact, Opportunity).", "Records");
    await upsertEndpoint(salesforce.id, "/sobjects/{sObjectType}/{id}", "GET", "Get Record",
        "Retrieves a Salesforce record by object type and ID.", "Records");
    await upsertEndpoint(salesforce.id, "/sobjects/{sObjectType}/{id}", "PATCH", "Update Record",
        "Updates the field values of a single Salesforce record.", "Records");
    await upsertEndpoint(salesforce.id, "/sobjects/{sObjectType}/{id}", "DELETE", "Delete Record",
        "Deletes a Salesforce record by object type and record ID.", "Records");
    await upsertEndpoint(salesforce.id, "/query", "GET", "Execute SOQL Query",
        "Executes a SOQL (Salesforce Object Query Language) query and returns the result set.", "Query");
    await upsertEndpoint(salesforce.id, "/search", "GET", "Execute SOSL Search",
        "Executes a SOSL (Salesforce Object Search Language) text search across all searchable objects.", "Query");
    await upsertEndpoint(salesforce.id, "/chatter/feeds/news/me/feed-elements", "GET", "Get Chatter Feed",
        "Returns the Chatter news feed for the current user including posts, comments, and files.", "Chatter");

    // ════════════════════════════════════════════
    // SLACK
    // ════════════════════════════════════════════
    await upsertEndpoint(slack.id, "/chat.postMessage", "POST", "Post Message",
        "Posts a message to a channel or DM. You can include text, blocks, and attachments.", "Messaging");
    await upsertEndpoint(slack.id, "/chat.update", "POST", "Update Message",
        "Updates a message in a channel. Used to modify previously sent messages.", "Messaging");
    await upsertEndpoint(slack.id, "/conversations.list", "GET", "List Conversations",
        "Returns a list of all channels, DMs, and MPIMs the bot/user is a member of.", "Channels");
    await upsertEndpoint(slack.id, "/conversations.history", "GET", "Get Channel History",
        "Retrieves a conversation's message history, newest messages first.", "Channels");
    await upsertEndpoint(slack.id, "/users.list", "GET", "List Users",
        "Returns a list of all users in a Slack workspace.", "Users");
    await upsertEndpoint(slack.id, "/files.upload", "POST", "Upload File",
        "Uploads a file and optionally shares it to a channel.", "Files");
    await upsertEndpoint(slack.id, "/reactions.add", "POST", "Add Reaction",
        "Adds an emoji reaction to a message.", "Reactions");

    // ════════════════════════════════════════════
    // GITHUB
    // ════════════════════════════════════════════
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/issues", "POST", "Create Issue",
        "Creates a new issue in the specified repository.", "Issues");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/issues", "GET", "List Issues",
        "Lists issues in a repository. Can filter by state, labels, assignee, milestone, and more.", "Issues");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/pulls", "POST", "Create Pull Request",
        "Creates a pull request from a branch into a target branch.", "Pull Requests");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/pulls", "GET", "List Pull Requests",
        "Lists pull requests in a repository, filterable by state and branch.", "Pull Requests");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/commits", "GET", "List Commits",
        "Returns an array of commits for a repository. Can filter by SHA, path, author, and date range.", "Repositories");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}", "GET", "Get Repository",
        "Returns data about a specific GitHub repository including metadata, stats, and permissions.", "Repositories");
    await upsertEndpoint(github.id, "/user/repos", "POST", "Create Repository",
        "Creates a new repository for the authenticated user.", "Repositories");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", "POST", "Trigger Workflow Dispatch",
        "Manually triggers a GitHub Actions workflow run.", "Actions");
    await upsertEndpoint(github.id, "/repos/{owner}/{repo}/releases", "POST", "Create Release",
        "Creates a new release attached to a tag in the repository.", "Releases");

    // ════════════════════════════════════════════
    // SENDGRID
    // ════════════════════════════════════════════
    await upsertEndpoint(sendgrid.id, "/mail/send", "POST", "Send Email",
        "Sends one or more emails using the SendGrid Web API v3. Supports transactional templates, dynamic data, and tracking.", "Mail");
    await upsertEndpoint(sendgrid.id, "/templates", "POST", "Create Dynamic Template",
        "Creates a new dynamic transactional email template.", "Templates");
    await upsertEndpoint(sendgrid.id, "/templates", "GET", "List Templates",
        "Returns a list of all transactional and legacy templates.", "Templates");
    await upsertEndpoint(sendgrid.id, "/marketing/contacts", "PUT", "Upsert Contacts",
        "Upserts up to 30,000 contacts into marketing lists. Creates or updates based on email address.", "Marketing");
    await upsertEndpoint(sendgrid.id, "/marketing/lists", "POST", "Create Contact List",
        "Creates a new marketing contact list.", "Marketing");
    await upsertEndpoint(sendgrid.id, "/stats", "GET", "Get Email Statistics",
        "Returns global email statistics for your account, optionally filtered by date range.", "Statistics");

    // ════════════════════════════════════════════
    // HUBSPOT
    // ════════════════════════════════════════════
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/contacts", "POST", "Create Contact",
        "Creates a new contact in HubSpot CRM. Email is the unique identifier.", "CRM - Contacts");
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/contacts/{contactId}", "GET", "Get Contact",
        "Retrieves a single contact by HubSpot contact ID.", "CRM - Contacts");
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/contacts/search", "POST", "Search Contacts",
        "Searches for contacts using filters, properties, and sort options.", "CRM - Contacts");
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/deals", "POST", "Create Deal",
        "Creates a new deal in HubSpot. Associate it with contacts and companies after creation.", "CRM - Deals");
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/deals/{dealId}", "PATCH", "Update Deal",
        "Updates properties on an existing deal.", "CRM - Deals");
    await upsertEndpoint(hubspot.id, "/crm/v3/objects/companies", "POST", "Create Company",
        "Creates a new company record in HubSpot CRM.", "CRM - Companies");
    await upsertEndpoint(hubspot.id, "/marketing/v3/emails", "GET", "List Marketing Emails",
        "Returns a list of marketing emails. Includes status, subject, and performance metadata.", "Marketing");
    await upsertEndpoint(hubspot.id, "/conversations/v3/conversations/threads", "GET", "List Conversation Threads",
        "Lists conversation inbox threads. Useful for inbox automation and support workflows.", "Conversations");

    // ════════════════════════════════════════════
    // OPENAI
    // ════════════════════════════════════════════
    await upsertEndpoint(openai.id, "/chat/completions", "POST", "Create Chat Completion",
        "Creates a model response for the given chat conversation. Supports GPT-4o, GPT-4, GPT-3.5-turbo and more.", "Chat");
    await upsertEndpoint(openai.id, "/completions", "POST", "Create Text Completion",
        "Creates a completion for the provided prompt and parameters. Use the chat endpoint for newer models.", "Completions");
    await upsertEndpoint(openai.id, "/embeddings", "POST", "Create Embeddings",
        "Creates an embedding vector representing the input text. Use for semantic search and clustering.", "Embeddings");
    await upsertEndpoint(openai.id, "/images/generations", "POST", "Generate Image (DALL·E)",
        "Creates image(s) given a text prompt. Supports DALL·E 3 and DALL·E 2.", "Images");
    await upsertEndpoint(openai.id, "/images/edits", "POST", "Edit Image",
        "Creates an edited version of an image given an original image and a prompt describing the edit.", "Images");
    await upsertEndpoint(openai.id, "/audio/transcriptions", "POST", "Transcribe Audio (Whisper)",
        "Transcribes audio into text using the Whisper model.", "Audio");
    await upsertEndpoint(openai.id, "/audio/speech", "POST", "Generate Speech (TTS)",
        "Generates spoken audio from text input using OpenAI's text-to-speech models.", "Audio");
    await upsertEndpoint(openai.id, "/fine_tuning/jobs", "POST", "Create Fine-Tuning Job",
        "Creates a fine-tuning job which creates a new model starting from a specified model.", "Fine Tuning");
    await upsertEndpoint(openai.id, "/models", "GET", "List Models",
        "Lists the currently available models and provides basic information about each one.", "Models");
    await upsertEndpoint(openai.id, "/assistants", "POST", "Create Assistant",
        "Creates a new assistant with a model and instructions. Assistants can call tools like Code Interpreter.", "Assistants");
    await upsertEndpoint(openai.id, "/threads/{threadId}/messages", "POST", "Add Message to Thread",
        "Adds a message to a thread for use with the Assistants API.", "Assistants");
    await upsertEndpoint(openai.id, "/threads/{threadId}/runs", "POST", "Run Assistant on Thread",
        "Creates a run on a thread, executing the assistant's instructions with the conversation.", "Assistants");

    // ════════════════════════════════════════════
    // AWS S3
    // ════════════════════════════════════════════
    await upsertEndpoint(aws_s3.id, "/{Bucket}/{Key}", "PUT", "Upload Object (PutObject)",
        "Adds an object to a bucket. You must have WRITE permissions on a bucket to add an object to it.", "Objects");
    await upsertEndpoint(aws_s3.id, "/{Bucket}/{Key}", "GET", "Download Object (GetObject)",
        "Retrieves an object from Amazon S3. You must have READ access to the object.", "Objects");
    await upsertEndpoint(aws_s3.id, "/{Bucket}/{Key}", "DELETE", "Delete Object",
        "Removes an object from Amazon S3.", "Objects");
    await upsertEndpoint(aws_s3.id, "/{Bucket}", "GET", "List Objects (ListObjectsV2)",
        "Returns some or all of the objects in a bucket with each request. Add a prefix to filter by folder.", "Objects");
    await upsertEndpoint(aws_s3.id, "/{Bucket}", "PUT", "Create Bucket",
        "Creates a new S3 bucket. Must be a globally unique name.", "Buckets");
    await upsertEndpoint(aws_s3.id, "/{Bucket}", "DELETE", "Delete Bucket",
        "Deletes the S3 bucket. All objects must be deleted before the bucket can be removed.", "Buckets");
    await upsertEndpoint(aws_s3.id, "/{Bucket}/{Key}?uploads", "POST", "Initiate Multipart Upload",
        "Initiates a multipart upload and returns an upload ID. Use for objects larger than 100MB.", "Multipart Upload");

    // ════════════════════════════════════════════
    // PLAID
    // ════════════════════════════════════════════
    await upsertEndpoint(plaid.id, "/link/token/create", "POST", "Create Link Token",
        "Creates a link_token required to initialize Plaid Link on the client side. Use to connect a bank account.", "Link");
    await upsertEndpoint(plaid.id, "/item/public_token/exchange", "POST", "Exchange Public Token",
        "Exchange a public_token (from Plaid Link) for an access_token used in subsequent API calls.", "Link");
    await upsertEndpoint(plaid.id, "/transactions/get", "POST", "Get Transactions",
        "Returns transaction history for bank accounts. Filter by date range. Returns up to 500 transactions per request.", "Transactions");
    await upsertEndpoint(plaid.id, "/accounts/get", "POST", "Get Account Balances",
        "Returns real-time balance information for all accounts associated with an Item.", "Accounts");
    await upsertEndpoint(plaid.id, "/identity/get", "POST", "Get Identity",
        "Retrieves identity data including name, address, and email from the financial institution.", "Identity");
    await upsertEndpoint(plaid.id, "/auth/get", "POST", "Get Auth (Routing / Account Numbers)",
        "Retrieves ACH or EFT routing and account numbers for bank accounts.", "Auth");
    await upsertEndpoint(plaid.id, "/transfer/create", "POST", "Create Transfer",
        "Initiates an ACH transfer. Requires prior authorization via /transfer/authorization/create.", "Transfers");

    // ════════════════════════════════════════════
    // ZENDESK
    // ════════════════════════════════════════════
    await upsertEndpoint(zendesk.id, "/tickets.json", "POST", "Create Ticket",
        "Creates a new support ticket.", "Tickets");
    await upsertEndpoint(zendesk.id, "/tickets/{id}.json", "GET", "Get Ticket",
        "Returns a specific ticket by ID.", "Tickets");
    await upsertEndpoint(zendesk.id, "/tickets/{id}.json", "PUT", "Update Ticket",
        "Updates an existing ticket's fields, status, or assignee.", "Tickets");
    await upsertEndpoint(zendesk.id, "/tickets.json", "GET", "List Tickets",
        "Lists all tickets in the account. Sorted by creation date, newest first.", "Tickets");
    await upsertEndpoint(zendesk.id, "/users.json", "POST", "Create User",
        "Creates a new user in your Zendesk account.", "Users");
    await upsertEndpoint(zendesk.id, "/search.json", "GET", "Search",
        "Returns search results in the response body. Supports tickets, users, organizations, and more.", "Search");
    await upsertEndpoint(zendesk.id, "/tickets/{ticketId}/comments.json", "GET", "List Ticket Comments",
        "Returns all comments on a specific ticket.", "Comments");

    // ════════════════════════════════════════════
    // SHOPIFY
    // ════════════════════════════════════════════
    await upsertEndpoint(shopify.id, "/products.json", "GET", "List Products",
        "Retrieves a list of products. Filterable by IDs, title, vendor, handle, and inventory status.", "Products");
    await upsertEndpoint(shopify.id, "/products.json", "POST", "Create Product",
        "Creates a new product in the store.", "Products");
    await upsertEndpoint(shopify.id, "/products/{product_id}.json", "PUT", "Update Product",
        "Updates a product's details, including title, description, variants, and images.", "Products");
    await upsertEndpoint(shopify.id, "/orders.json", "GET", "List Orders",
        "Retrieves a list of orders. Filter by status, financial_status, fulfillment_status, and date range.", "Orders");
    await upsertEndpoint(shopify.id, "/orders/{order_id}.json", "GET", "Get Order",
        "Retrieves a specific order by ID including line items, customer info, and fulfillment status.", "Orders");
    await upsertEndpoint(shopify.id, "/orders/{order_id}/fulfillments.json", "POST", "Create Fulfillment",
        "Creates a fulfillment for one or more line items in an order.", "Fulfillments");
    await upsertEndpoint(shopify.id, "/customers.json", "GET", "List Customers",
        "Retrieves a list of customers.", "Customers");
    await upsertEndpoint(shopify.id, "/customers.json", "POST", "Create Customer",
        "Creates a new customer record.", "Customers");
    await upsertEndpoint(shopify.id, "/inventory_levels.json", "GET", "Get Inventory Levels",
        "Retrieves a list of inventory levels for specified locations and inventory item IDs.", "Inventory");

    // ════════════════════════════════════════════
    // DOCUSIGN
    // ════════════════════════════════════════════
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/envelopes", "POST", "Create Envelope (Send for Signature)",
        "Creates and optionally sends an envelope. Envelopes contain documents for recipients to sign.", "Envelopes");
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/envelopes/{envelopeId}", "GET", "Get Envelope Status",
        "Returns status and details of a specific envelope.", "Envelopes");
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}", "GET", "Download Signed Document",
        "Retrieves the signed PDF document from a completed envelope.", "Documents");
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/envelopes", "GET", "List Envelopes",
        "Returns a list of envelopes that match specified criteria such as status and date range.", "Envelopes");
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs", "GET", "Get Recipient Tabs",
        "Returns the tabs (signature fields, text fields, etc.) for a specific envelope recipient.", "Recipients");
    await upsertEndpoint(docusign.id, "/accounts/{accountId}/templates", "GET", "List Templates",
        "Returns a list of templates available in your DocuSign account.", "Templates");

    
    // ════════════════════════════════════════════
    // ICE MORTGAGE TECHNOLOGY
    // ════════════════════════════════════════════
    const icePlatform = await prisma.platform.upsert({
        where: { name: "ICE Mortgage Technology" },
        create: { name: "ICE Mortgage Technology", baseUrl: "https://api.icemortgagetechnology.com", authType: "OAuth2" },
        update: {},
    });

    await upsertEndpoint(icePlatform.id, "/v1/api-previews", "GET", "API Previews", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-11", "GET", "Loan Opportunity Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-11", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-affordability-qualification", "GET", "Affordability", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-affordability-qualification", "GET", "Get Affordability Qualification Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-affordability-qualification-setting", "GET", "Create Affordability Qualification Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-affordabilityqualification", "GET", "Update Affordability Qualification Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-affordability-qualification", "GET", "Delete an Affordability Qualification", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-email-templates", "GET", "Email Template Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-email-templates", "GET", "Get Email Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-new-email-template", "GET", "Create Email Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-email-template-details", "GET", "Get Email Template Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-email-template", "GET", "Update Email Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-an-email-template", "GET", "Delete an Email Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-feature-management", "GET", "Feature Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-feature-management", "GET", "Get Feature Management Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-new-feature", "GET", "Create New Feature", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-feature-management", "GET", "Update a Feature Management Setting", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-feature", "GET", "Update a Feature", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-feature-management-setting", "GET", "Delete a Feature Management Setting", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-letter-template", "GET", "Letter Template Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-letter-template", "GET", "Get List of Letter Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-letter-template-details", "GET", "Get Letter Template Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-new-letter-template", "GET", "Create a Letter Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-existing-letter-template", "GET", "Update Letter Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-letter-template", "GET", "Delete Letter Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-opportunity", "GET", "Loan Opportunity Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-12", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-scenario", "GET", "Get All Scenarios", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-scenario-1", "GET", "Get a Scenario", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-scenario", "GET", "Create a Scenario", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-scenario", "GET", "Update a Scenario", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/updates-a-scenario", "GET", "Updates a Scenario", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-scenario", "GET", "Delete a Scenario", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/convert-scenario-to-loan", "GET", "Convert Scenario to Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-notification", "GET", "Send a Notification Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-loan-opportunity", "GET", "Get a Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-opportunities", "GET", "Get Loan Opportunities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-loan-opportunity", "GET", "Create Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-loan-opportunity-1", "GET", "Update Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-loan-opportunity", "GET", "Replace Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-loan-opportunity", "GET", "Delete Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/convert-loan-opportunity", "GET", "Convert Loan Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-13", "GET", "Document Management for an Opportunity", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-13", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-document", "GET", "Get a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-document", "GET", "Create a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-document", "GET", "Update a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-opportunity-selector", "GET", "Loan Opportunity Selector", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-opportunities-with-search", "GET", "Get Loan Opportunities with Search", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/prospect-engagement", "GET", "Prospect Engagement", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-14", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-an-invitation", "GET", "Create Invitation URL", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-reminder-url", "GET", "Create Reminder URL", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-packages", "GET", "Packages", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-packages", "GET", "Get Packages", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-package", "GET", "Get Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-session-api", "GET", "Point of Sale Integration Framework", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-session-api", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-package-event", "GET", "Create a Package Event", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-session", "GET", "Create a Session", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/borrower-contacts-management", "GET", "Borrower", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/borrower-contracts", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-linking-contacts-to-a-loan", "GET", "Link Borrower Contacts to a Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-contact-list", "GET", "V1 Get Borrower Contact List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-contacts", "GET", "V1 Get a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-contacts-with-pagination", "GET", "V1 View Borrower Contacts (with Pagination)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-contact", "GET", "V1 Create Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-contact", "GET", "V1 Update Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-borrower-contact", "GET", "V1 Delete Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-notes", "GET", "V1 Get All Notes for a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-note", "GET", "V1 Get a Note for a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-note", "GET", "V1 Create a Note for a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-note", "GET", "V1 Update a Note for a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-note", "GET", "V1 Delete a Note for a Borrower Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contacts-groups", "GET", "Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/groups", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-contact-groups", "GET", "V1 Get All Contact Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-contact-group", "GET", "V1 Get a Contact Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-contacts-in-contact-group", "GET", "V1 Get All Contacts in Contact Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-contact-group", "GET", "V1 Create Contact Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-or-remove-group-contacts", "GET", "V1 Add or Remove Group Contacts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-contact-group", "GET", "V1 Update a Contact Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-contact-group", "GET", "V1 Delete a Contact Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/business-contact-management", "GET", "Business", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/linking-business-contacts-to-a-loan", "GET", "Link Business Contacts to a Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-business-contact-list", "GET", "V1 Get Business Contact List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-contact-business", "GET", "V1 Get a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-contacts-with-pagination-1", "GET", "V1 View Business Contacts (with Pagination)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-contact-business", "GET", "V1 Create a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-contact-1", "GET", "V1 Update a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-contact-business", "GET", "V1 Delete a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-note-business", "GET", "V1 Get a Note for a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-note-business", "GET", "V1 Create Note for a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-note-business", "GET", "V1 Update Note for a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-note-business", "GET", "V1 Delete Note for a Business Contact", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/send-docs", "GET", "Send Encompass Docs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-send-encompass-docs", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-plan-codes", "GET", "Manage Plan Codes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/apply-plan-code", "GET", "Apply Plan Code", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-plan-codes", "GET", "Get Plan Codes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/audit-loan-file", "GET", "Audit Loan File", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/audit-opening", "GET", "Create Loan Audit for Opening Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/audit-closing-loan-file", "GET", "Create Loan Audit for Closing Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-document-audit-to-remove-copy", "GET", "Get Document Audit for Opening Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-document-audit-to-remove-copy-copy", "GET", "Get Document Audit for Closing Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/generate-package", "GET", "Generate Document Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/generate-opening-doc-set", "GET", "Generate Opening Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/generate-closing-doc-set", "GET", "Generate Closing Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/generate-forms", "GET", "Generate Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-order-status", "GET", "Get Opening Order Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-closing-order-status", "GET", "Get Closing Order Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/append-documents-to-opening-doc-set", "GET", "Add Documents to a Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-docs-to-opening-doc-set", "GET", "Add to Opening Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-docs-to-opening-doc-set", "GET", "Get Opening Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-docs-to-closing-doc-set", "GET", "Add to Closing Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-docs-added-to-closing-doc-set", "GET", "Get Closing Doc Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/send-documents-order", "GET", "Send Document Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/send-initial-disclosures", "GET", "Send Opening Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/send-closing-docs", "GET", "Send Closing Package", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/send-forms", "GET", "Send Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-delivery-details", "GET", "Get Opening Package Delivery Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-closing-package-delivery-details", "GET", "Get Closing Package Delivery Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-forms-delivery-details", "GET", "Get Forms Delivery Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/print-or-preview-forms", "GET", "Print on Demand", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/print-forms", "GET", "Generate a Print Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/223-get-print-job-url", "GET", "Get a Print Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-associates-milestones", "GET", "Associates & Milestones", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-milestone", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-milestone-logs-list", "GET", "V3 Get Milestone Logs List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-milestone-log", "GET", "V3 Get Milestone Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-milestone-log", "GET", "V3 Update Milestone Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-milestonefree-role-list", "GET", "V3 Get Milestone Free Role List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-milestone-free-role", "GET", "V3 Update Milestone Free Role", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-milestone-dates", "GET", "V3 Update Milestone Dates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-6", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-associates", "GET", "V1 Get List of Associates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/assign-loan-associate", "GET", "V1 Assign a Loan Associate", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-milestones", "GET", "V1 Get All Milestones", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-milestone-free-roles", "GET", "V1 Get All Milestone Free Roles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-associate", "GET", "V1 Get an Associate", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-milestone", "GET", "V1 Get a Milestone", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-milestone", "GET", "V1 Update a Milestone", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-milestone-free-role", "GET", "V1 Get a Milestone Free Role", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-milestone-free-role", "GET", "V1 Update a Milestone-Free Role", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/pull-field-audit-data", "GET", "Audit Trail", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/pull-field-audit-data", "GET", "V3 Pull Loan Field Audit Data", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-borrower-pair", "GET", "Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-3", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-pairs", "GET", "V1 Get All Borrower Pairs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-pair", "GET", "V1 Get a Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-borrower-pair", "GET", "V1 Create Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-borrower-pair", "GET", "V1 Update Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-borrower-pair", "GET", "V1 Delete Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/move-borrower-pair", "GET", "V1 Move Borrower Pair", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/borrower-vesting", "GET", "Borrower Vesting", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-1", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-vesting-entities", "GET", "V3 View Vesting Entities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-vesting-entities", "GET", "V3 Manage Vesting Entities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/batch-update", "GET", "Batch Update", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-status", "GET", "V1 Get Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-loans", "GET", "V1 Update Loans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/calculators", "GET", "Calculators", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/tools-transient-calculator", "GET", "Loan Calculations", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-15", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/calculate-loan", "GET", "V1 Calculate Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/print-form-calculators", "GET", "Print Form Calculators", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-std-print-form-calc", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-standard-print-forms-loan", "GET", "V3 Generate List of Standard Print Forms for a Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/compliance-calculator", "GET", "Compliance Calculator", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-compliance-calc", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-compliance-calendar-date-calc", "GET", "V3 Compliance Calendar Date Calculator", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-disaster-collection", "GET", "Disasters Collection", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-disaster-collection", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-disasters", "GET", "V3 Get Disasters", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-disasters", "GET", "V3 Manage Disasters", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/efolder-document-1", "GET", "eFolder Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-attributes-v3-3", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-documents", "GET", "V3 Get List of Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-document-1", "GET", "V3 Get a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-documents-1", "GET", "V3 Manage Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/assign-document-attachments", "GET", "V3 Assign Document Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-comments-to-a-document", "GET", "V3 Add Comments to a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-attributes-v1-2", "GET", "V1 Contract", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-documents", "GET", "V1 Get List of Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-document", "GET", "V1 Get a Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-document-attachments", "GET", "V1 Get Document Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-document", "GET", "V1 Create Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-document", "GET", "V1 Update Document", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/assign-document-attachment", "GET", "V1 Assign Document Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/efolder-attachment-1", "GET", "eFolder Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-attributes-v3-4", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-attachments", "GET", "V3 Get List of Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-attachment", "GET", "V3 Get an Attachment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-or-remove-attachments", "GET", "V3 Update or Remove Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-attachment-url", "GET", "V3 Create Attachment URL", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-download-attachment-url", "GET", "V3 Get Download Attachment URL", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-attributes-v1-3", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-attachments", "GET", "V1 Get List of Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-attachment", "GET", "V1 Get an Attachment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-get-attachment-metadata", "GET", "V1 Get Attachment Metadata", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/upload-attachment-to-efolder", "GET", "V1 Upload Attachment to eFolder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-attachment-url", "GET", "V1 Get Attachment from eFolder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-thumbnail-of-page", "GET", "V1 Get Thumbnail of Page", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-page-of-attachment", "GET", "V1 Get Page of Attachment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-attachment", "GET", "V1 Update Attachment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-2", "GET", "eFolder Export Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-2", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-export-status", "GET", "Get Export Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/export-attachments", "GET", "Export Attachments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/export-files-job-creator", "GET", "Export Files Job Creator", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-history", "GET", "eFolder History", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-history", "GET", "V3 Get eFolder History", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/import-loan-from-file", "GET", "Import from File", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/converter-to-import-new-loan", "GET", "V3 Converter to Import New Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/importer-to-update-loan", "GET", "V3 Importer to Update Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-loan-from-import-file", "GET", "V1 Loan Importer to Create Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts", "GET", "Loan Contacts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-affiliated-business-arrangements", "GET", "V3 Get Affiliated Business Arrangements", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-affiliated-business-arrangements", "GET", "V3 Manage Affiliated Business Arrangements", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-service-provider-contacts-list", "GET", "V3 Manage Service Provider Contacts List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-service-provider-contacts", "GET", "V3 Get Service Provider Contacts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-homecounselingprovider", "GET", "V3 Get Home Counseling Provider", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-home-counseling-providers-list", "GET", "V3 Manage Home Counseling Providers List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-conditions", "GET", "Loan Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-8", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-underwriting-condition", "GET", "V1 Get an Underwriting Condition", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-underwriting-conditions", "GET", "V1 Get All Underwriting Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-underwriting-conditions", "GET", "V1 Create Underwriting Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-underwriting-conditions", "GET", "V1 Manage Underwriting Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-underwriting-comments", "GET", "V1 Manage Underwriting Comments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-underwriting-documents", "GET", "V1 Manage Underwriting Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-preliminary-conditions-1", "GET", "V1 Get All Preliminary Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-preliminary-conditions", "GET", "V1 Get a Preliminary Condition", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-preliminary-conditions", "GET", "V1 Create Preliminary Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-preliminary-conditions", "GET", "V1 Manage Preliminary Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-preliminary-comments", "GET", "V1 Manage Preliminary Comments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-preliminary-documents", "GET", "V1 Manage Preliminary Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-post-closing-conditions", "GET", "V1 Get All Post-Closing Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-post-closing-condition", "GET", "V1 Get a Post-Closing Condition", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-post-closing-conditions", "GET", "V1 Create Post-Closing Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-post-closing-conditions", "GET", "V1 Manage Post-Closing Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-post-closing-comments", "GET", "V1 Manage Post-Closing Comments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-post-closing-documents", "GET", "V1 Manage Post-Closing Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-enhanced-conditions", "GET", "Loan Enhanced Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-7", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-enhanced-conditions", "GET", "V3 Get All Enhanced Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-enhanced-condition", "GET", "V3 Get an Enhanced Condition", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-enhanced-conditions-1", "GET", "V3 Manage Enhanced Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-comments", "GET", "V3 Get Comments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-comments", "GET", "V3 Manage Comments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-documents-1", "GET", "V3 Get Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-documents", "GET", "V3 Manage Documents", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-tracking-entries", "GET", "V3 Get Tracking Entries", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-tracking-entries", "GET", "V3 Manage Tracking Entries", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-management", "GET", "Loan Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-1", "GET", "V3 Get Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-loan-1", "GET", "V3 Create Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-loan-1", "GET", "V3 Update Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-loan-1", "GET", "V3 Delete Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-ucd-fields", "GET", "V3 Get UCD Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan", "GET", "V1 Get Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-supported-entities", "GET", "V1 Get Supported Entities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-loan", "GET", "V1 Create Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/move-to-loan-folder", "GET", "V1 Move Loan to Folder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-loan", "GET", "V1 Delete Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-loan", "GET", "V1 Update Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-management-reader-writer", "GET", "Loan Management (Reader / Writer)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-4", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-field-reader", "GET", "V3 Field Reader", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-field-writer", "GET", "V3 Field Writer", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-field-lock-data", "GET", "V3 Update Field Lock Data", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-field-reader", "GET", "V1 Field Reader", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-pipeline", "GET", "Loan Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contract-attributes", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-create-cursor", "GET", "V3 Loan Pipeline for Reports", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-pipeline-with-pagination-1", "GET", "V3 Loan Pipeline (with Pagination)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-canonical-names", "GET", "V3 Get Pipeline Canonical Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-pipeline-contracts", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-get-canonical-fields", "GET", "V1 Get Pipeline Canonical Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-cursor", "GET", "V1 Create Cursor", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-pipeline-with-pagination", "GET", "V1 Loan Pipeline (with Pagination)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/view-pipeline", "GET", "V1 Loan Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/non-borrowing-owners", "GET", "Non-Borrowing Owners", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-non-borrowing-owners", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-non-borrowing-owners", "GET", "V3 Get Non-Borrowing Owners", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-non-borrowing-owners", "GET", "V3 Manage Non-Borrowing Owners", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/rate-lock-management", "GET", "Rate Lock", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-2", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-rate-lock", "GET", "V1 Get All Rate Lock Requests", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-rate-lock-request", "GET", "V1 Get a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-snapshot-of-a-rate-lock", "GET", "V1 Get Snapshot of a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/submit-a-rate-lock-request", "GET", "V1 Submit a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-rate-lock-request", "GET", "V1 Update a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/confirm-a-rate-lock-request", "GET", "V1 Confirm a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/cancel-lock-request", "GET", "V1 Cancel Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/deny-a-rate-lock-request", "GET", "V1 Deny a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/void-a-rate-lock-request", "GET", "V1 Void a Rate Lock Request", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-8", "GET", "Recipients", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-8", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-recipients", "GET", "V3 Get Recipients", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-3", "GET", "URLA Alternate Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-3", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-urla-alternate-names", "GET", "V3 Get URLA Alternate Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-urla-version", "GET", "V3 Update URLA Version", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-urla-alternate-names", "GET", "V3 Update URLA Alternate Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-funding-fees", "GET", "Manage Funding Fees", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-funding-fees", "GET", "V3 Get Funding Fees", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-patch-funding-balances", "GET", "V3 Update Funding Balances", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-funding-balances", "GET", "Manage Funding Balances", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-funding-balances", "GET", "V3 Get Funding Balances", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-disclosure-tracking-2015", "GET", "Disclosure Tracking (2015)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-list-of-disclosure-tracking-logs", "GET", "V3 Get a List of Disclosure Tracking Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-a-disclosure-tracking-log", "GET", "V3 Add a Disclosure Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-disclosure-tracking-log-1", "GET", "V3 Get a Disclosure Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-disclosure-tracking-log-email-messages", "GET", "V3 Get Disclosure Tracking Log Email Messages", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-dt-snapshots", "GET", "V3 Get Disclosure Tracking Snapshots", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-dt-snapshot", "GET", "V3 Get Disclosure Tracking Snapshot", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-disclosure-tracking-log", "GET", "V3 Update a Disclosure Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-add-manual-fulfillment", "GET", "V3 Add Manual Fulfillment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-disclosure-tracking-logs", "GET", "V1 Get a List of Disclosure Tracking Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-disclosure-tracking-log", "GET", "V1 Get a Disclosure Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-snapshot", "GET", "V1 Get Snapshot", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-metadata", "GET", "Loan Metadata", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-get-loan-metadata", "GET", "V1 Get Loan Metadata", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/aus-tracking", "GET", "AUS Tracking", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-aus-tracking-log", "GET", "V1 Get All AUS Tracking Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-an-aus-tracking-log", "GET", "V1 Create an AUS Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-aus-tracking-log", "GET", "V1 Get an AUS Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-an-aus-tracking-log", "GET", "V1 Update an AUS Tracking Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-aus-tracking-log-snapshot", "GET", "V1 Get AUS Tracking Log Snapshot", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-conversation-log-1", "GET", "Conversation Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-conversation-log", "GET", "V3 Create Conversation Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-conversation-logs", "GET", "V1 Get All Conversation Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-conversation-log", "GET", "V1 Get a Conversation Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-registration-logs", "GET", "Registration Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-registration-logs", "GET", "V3 Get Registration Logs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-registration-log", "GET", "V3 Create Registration Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-registration-log", "GET", "V3 Get a Registration Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-registration-log", "GET", "V3 Update Registration Log", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-vods", "GET", "Verification Input Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-vods", "GET", "V3 Get VODs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-vods", "GET", "V3 Manage VODs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-non-vols", "GET", "V3 Get non-VOLs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-non-vols", "GET", "V3 Manage non-VOLs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-employment", "GET", "V3 Get Employment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-employment", "GET", "V3 Manage Employment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-residences", "GET", "V3 Get Residences", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-residences", "GET", "V3 Manage Residences", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-additional-loans", "GET", "V3 Get Additional Loans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-additional-loans", "GET", "V3 Manage Additional Loans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-vols", "GET", "V3 Get VOLs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-vols", "GET", "V3 Manage VOLs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-other-income", "GET", "Assets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-other-income", "GET", "V3 Get Other Income", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-other-incomes", "GET", "V3 Manage Other Incomes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-other-assets", "GET", "V3 Get Other Assets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-other-assets", "GET", "V3 Manage Other Assets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-gifts-and-grants", "GET", "V3 Get Gifts and Grants", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-gifts-and-grants", "GET", "V3 Manage Gifts and Grants", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-reo-properties", "GET", "V3 Get REO Properties", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-reo-properties", "GET", "V3 Manage REO Properties", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-other-liabilities", "GET", "Liabilities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-other-liabilities", "GET", "V3 Get Other Liabilities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-other-liabilities", "GET", "V3 Manage Other Liabilities", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-lock-1", "GET", "Loan Resource Lock", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-resource-locks", "GET", "V3 Get List of Resource Locks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/lock-resource-1", "GET", "V3 Lock Resource", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-resource-lock", "GET", "V3 Get a Resource Lock", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/unlock-resource-1", "GET", "V3 Unlock Resource", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-resource-locks", "GET", "V1 Get List of Resource Locks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/lock-resource", "GET", "V1 Lock Resource", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-resource-lock", "GET", "V1 Get a Resource Lock", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/unlock-resource", "GET", "V1 Unlock Resource", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-request-for-transcript-of-tax", "GET", "Request for Transcript of Tax", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-request-for-transcript-of-tax", "GET", "Preview: V3 Get Request for Transcript of Tax", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-patch-request-for-transcript-of-tax", "GET", "V3 Update Request for Transcript of Tax", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-schema", "GET", "Schema", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-attributes-v3-2", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-schema-1", "GET", "V3 Get Loan Schema", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-field-schema-1", "GET", "V3 Get Field Schema", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-virtual-fields", "GET", "V3 Get Virtual Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-schema", "GET", "V1 Get Loan Schema", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-field-schema", "GET", "V1 Get Field Schema", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/path-generator", "GET", "V1 Path Generator", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contract-generator", "GET", "V1 Contract Generator", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/correspondent-trades", "GET", "Correspondent Trades", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/trade-pipeline", "GET", "Trade Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-10", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-trade-pipeline-of-correspondent-trade", "GET", "Get Trade Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-field-definitions", "GET", "Get Field Definitions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/trade-management", "GET", "Trade Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-correspondent-trade", "GET", "Create a Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-correspondent-trade", "GET", "Get Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-correspondent-trade", "GET", "Update a Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-event-history", "GET", "Get Event History", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/assign-loans-to-correspondent-trade", "GET", "Assign Loans to Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-correspondent-trade", "GET", "Unassign Loans From a Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-correspondent-trade-notes", "GET", "Get Notes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-trade-note", "GET", "Create a Note", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-note", "GET", "Manage a Note", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-correspondent-trade-statistics", "GET", "Get Correspondent Trade Statistics", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extend-a-correspondent-trade", "GET", "Extend a Correspondent Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-create-pipeline-view", "GET", "Loan Pipeline Views", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-create-pipeline-view", "GET", "Preview: V3 Create Pipeline View", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-pipeline-view", "GET", "Preview: V3 Update Pipeline View", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/service-orders", "GET", "Service Orders", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/credit-partners-and-samples", "GET", "Credit Partners and Supported Products", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/retrieve-raw-xml-files", "GET", "Retrieve Raw XML Files", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/aus-partners-and-samples", "GET", "AUS Providers and Samples", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/freddie-mac-affordable-check-api", "GET", "Freddie Mac Affordable Check API", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/freddie-mac-datashare-apis", "GET", "Freddie Mac Datashare APIs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/order-services", "GET", "Order Services", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-service-order-status", "GET", "Get Service Order Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/overview-2", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-mapping-1", "GET", "User Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-mapping-1", "GET", "Get User Mapping", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/map-epps-user", "GET", "Map ICE PPE User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-programs-and-rates", "GET", "Rates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-programs-and-rates", "GET", "Get Programs and Rates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v2-get-eligible-rates", "GET", "Get Eligible Rates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/select-rate", "GET", "Select Rate", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-adjustments-1", "GET", "Get Adjustments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-guidelines", "GET", "Guidelines", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-guidelines", "GET", "Get Guideline Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/agency-approvals", "GET", "Lookups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/agency-approvals", "GET", "Get Agency Approvals", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/bankruptcy", "GET", "Get Bankruptcy", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-buydown-type", "GET", "Get Buydown Type", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-buydown-contributor-type", "GET", "Get Buydown Contributor Type", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-citizenship", "GET", "Get Citizenship", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-client-settings", "GET", "Get Client Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-commitment-types", "GET", "Get Commitment Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/counties", "GET", "Get Counties", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/epps-get-custom-fields", "GET", "Get Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delivery-types", "GET", "Get Delivery Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-documentation-types", "GET", "Get Documentation Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/encompass-elements", "GET", "Get Encompass Elements", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/foreclosure", "GET", "Get Foreclosure", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/investors", "GET", "Get Investors", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/lien-position", "GET", "Get Lien Position", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-terms", "GET", "Get Loan Terms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-usage", "GET", "Get Loan Usage", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-limits", "GET", "Get Loan Limits", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-locations", "GET", "Get Locations", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/lock-days", "GET", "Get Lock Days", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/nod-types", "GET", "NOD Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-non-qm-doc-level", "GET", "Get Non QM Doc Level", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/prepay-penalty-terms", "GET", "Get Prepay Penalty Terms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/product-options", "GET", "Get Product Options", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/property-types", "GET", "Get Property Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/property-use", "GET", "Get Property Use", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/special-products", "GET", "Get Special Products", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/standard-products", "GET", "Get Standard Products", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/states", "GET", "Get States", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-unit-types", "GET", "Get Unit Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/encompass-compliance-service-1", "GET", "Encompass Compliance Service", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-compliance-report", "GET", "Create Compliance Report", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-compliance-reports", "GET", "Get Compliance Report", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-milestones", "GET", "Milestones", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-milestones", "GET", "V3 Get List of Milestones", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-details-specific-milestone", "GET", "V3 Get Details on Specific Milestone", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings", "GET", "Organizations", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-root-organization-detail", "GET", "V1 Get Root Organization Detail", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-organizations", "GET", "V1 Get All Organizations", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-organization-detail", "GET", "V1 Get Organization Detail", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-children-of-organization", "GET", "V1 Get Children of Organization", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-personas", "GET", "Personas", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-list-of-personas-1", "GET", "V3 Get a List of Personas", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-persona-1", "GET", "V3 Get a Persona", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-list-of-personas", "GET", "V1 Get a List of Personas", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-persona", "GET", "V1 Get a Specific Persona", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/roles", "GET", "Roles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-of-roles", "GET", "V3 Get List of Roles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-specific-role-details", "GET", "V3 Get Specific Role Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-role-mappings", "GET", "V3 Get Role Mappings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-list-of-roles", "GET", "V1 Get a List of Roles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-canonical-names", "GET", "Borrower Contacts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-borrower-canonical-names", "GET", "V1 Get Borrower Canonical Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-business-canonical-names", "GET", "Business Contacts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-business-canonical-names", "GET", "V1 Get Business Contact Canonical Names", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-bus-contacts-custom-fields", "GET", "V3 Get Business Contacts Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-bus-contacts-categories", "GET", "V3 Get Business Contacts Categories", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-bus-contacts-custom-cat-fields", "GET", "V3 Get Business Contacts Category Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-document-settings", "GET", "eFolder Setup", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-document-settings", "GET", "V3 Get eFolder Document Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-document-options", "GET", "V3 Get eFolder Document Options", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-efolder-doc-stacking-templates", "GET", "V3 Get List of eFolder Document Stacking Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-efolder-doc-stacking-template-details", "GET", "V3 Get eFolder Document Stacking Template Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-external-organizations", "GET", "Company Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-external-organizations", "GET", "V3 Get External Organizations (Slated for Deprecation)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-external-organization", "GET", "V3 Get an External Organization (Slated for Deprecation)", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-external-orgs", "GET", "V3 Get External Organizations", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-create-external-organization", "GET", "V3 Create External Organization", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-external-organization", "GET", "V3 Get External Organization", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-external-organization", "GET", "V3 Update External Organization", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-dba-records", "GET", "V3 Manage DBA Records", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-warehouse-details", "GET", "V3 Manage Warehouse Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-external-organization-site-urls", "GET", "V3 Manage External Organization Site URLs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-external-organization-commitments", "GET", "V3 Get External Organization Commitments", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-company-status", "GET", "TPO Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-company-status", "GET", "V3 Get Company Status", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-company-rating", "GET", "V3 Get Company Rating", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-company-price-groups", "GET", "V3 Get Company Price Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-tpo-custom-field-definitions", "GET", "TPO Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-tpo-custom-field-definitions", "GET", "V3 Get TPO Custom Field Definitions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-global-tpo-fees", "GET", "TPO Fees", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-global-tpo-fees", "GET", "V3 Get Global TPO Fees", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-global-tpo-fee-details", "GET", "V3 Get Global TPO Fee Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-global-tpo-late-fees", "GET", "V3 Get Global TPO Late Fees", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-external-banks", "GET", "Warehouse Banks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-external-banks", "GET", "V3 Get External Banks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-external-users", "GET", "Manage External Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-external-users", "GET", "V3 Get All External Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-external-users", "GET", "V3 Manage External Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-external-user", "GET", "V3 Get an External User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-effective-rights-of-external-user", "GET", "V3 Get Effective Rights of External User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-disclosure-tracking", "GET", "Disclosure Tracking", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-disclosure-tracking-settings", "GET", "V3 Get Disclosure Tracking Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-hmda-profiles", "GET", "HMDA Profiles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-of-hmda-profiles", "GET", "V3 Get List of HMDA Profiles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-hmda-profile-details", "GET", "V3 Get HMDA Profile Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-enhanced-conditions", "GET", "Enhanced Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-enhanced-condition-types", "GET", "V3 Get All Enhanced Condition Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-enhanced-condition-types", "GET", "V3 Manage Enhanced Condition Types", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-enhanced-condition-type", "GET", "V3 Get an Enhanced Condition Type", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-enhanced-condition-sets", "GET", "V3 Get All Enhanced Condition Sets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-enhanced-condition-set", "GET", "V3 Get an Enhanced Condition Set", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-enhanced-condition-templates", "GET", "V3 Get All Enhanced Condition Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-enhanced-condition-templates", "GET", "V3 Manage Enhanced Condition Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-enhanced-condition-template", "GET", "V3 Get an Enhanced Condition Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/evaluate-automated-conditions", "GET", "V3 Evaluate Automated Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-custom-fields", "GET", "Loan Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-custom-fields", "GET", "V3 Get Loan Custom Field Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-custom-fields", "GET", "V3 Manage Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-custom-fields", "GET", "V1 Get All Custom Fields", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-custom-field", "GET", "V1 Get a Custom Field", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/loan-folder", "GET", "Loan Folder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-loan-folders", "GET", "V3 Get List of Loan Folders", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-loan-folder", "GET", "V3 Get a Loan Folder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-loan-print-forms", "GET", "Loan Print Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-print-form-groups", "GET", "V3 Get List of Print Form Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-print-form-group-details", "GET", "V3 Get Print Form Group Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-standard-print-forms", "GET", "V3 Get List of Standard Print Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-encompass-v3-settings-loan-customprintforms", "GET", "V3 Get List of Custom Print Forms", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-policies", "GET", "Policies", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/referenceget-urla-configuration", "GET", "V3 Get URLA Configuration", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-loan-templates", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-closing-cost-templates", "GET", "Closing Cost Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-closing-cost-templates", "GET", "V3 Get List of Closing Cost Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-closing-cost-template-settings", "GET", "V3 Get Closing Cost Template Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-program-templates", "GET", "Loan Program Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-loan-program-templates", "GET", "V3 Get List of Loan Program Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-loan-program-template-settings", "GET", "V3 Get Loan Program Template Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-settlement-service-providers-1", "GET", "Settlement Service Provider Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-settlement-service-providers-1", "GET", "V3 Get List of Settlement Service Provider Template Folders", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-settlement-service-providers", "GET", "V3 Get Details of a Settlement Service Provider Template File", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-of-transcript-of-tax-templates", "GET", "Transcript of Tax Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-of-transcript-of-tax-templates", "GET", "V3 Get List of Transcript of Tax Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-transcript-of-tax-template", "GET", "V3 Get Transcript of Tax Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-loan-template-sets", "GET", "Loan Template Sets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-loan-template-sets", "GET", "V3 Get List of Loan Template Sets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-template-folders", "GET", "V1 Get List of Loan Template Sets", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-template-files", "GET", "V1 Get Loan Template Set Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/overview-1", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-user", "GET", "Manage SCIM Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-user", "GET", "Create a User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-users", "GET", "Get Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user", "GET", "Get User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-user", "GET", "Update User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-user", "GET", "Delete User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-groups", "GET", "Manage SCIM Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-groups", "GET", "Get User Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-group", "GET", "Get User Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-user-group", "GET", "Update User Group", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-account-link", "GET", "Manage SCIM Account Links", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-account-link", "GET", "Create an Account Link", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-linked-accounts", "GET", "Get Linked Accounts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-account-link", "GET", "Delete an Account Link", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/link-user-to-existing-guid", "GET", "Link User to Existing GUID", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-secondary-1", "GET", "Secondary Setup", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-funding-templates", "GET", "V3 Get Funding Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-investor-template", "GET", "V3 Get an Investor Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-investor-templates", "GET", "V3 Get Investor Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/fee-management", "GET", "Fee Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-itemization-fee-management", "GET", "V3 Get Itemization Fee Management", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-loan-originator-compensation-plans", "GET", "V3 Get Loan Originator Compensation Plans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/cdo-loan", "GET", "Custom Data Objects", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-12", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-loan-cdos", "GET", "V1 Get List of Loan CDOs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-loan-cdo", "GET", "V1 Get a Loan CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-or-replace-a-loan-cdo", "GET", "V1 Create or Replace Loan CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-loan-cdo", "GET", "V1 Delete Loan CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-loan-cdo", "GET", "V1 Update Loan CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-cdos", "GET", "V1 Get List of User CDOs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-user-cdo", "GET", "V1 Get a User CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-or-replace-user-cdo", "GET", "V1 Create or Replace User CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-user-cdo", "GET", "V1 Delete User CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-user-cdo", "GET", "V1 Update User CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-global-cdos", "GET", "V1 Get List of Global CDOs", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-global-cdo", "GET", "V1 Get a Global CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-or-replace-global-cdo", "GET", "V1 Create or Replace Global CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-global-cdo", "GET", "V1 Delete Global CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-global-cdo", "GET", "V1 Update Global CDO", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/settings-compliance-reports", "GET", "Settings: Compliance Reports", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/contracts-scr", "GET", "Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/manage-comp-settings-rpt-permissions", "GET", "Manage Compliance Settings Report Permissions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/users", "GET", "Settings: Internal Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-contracts-9", "GET", "V3 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-eligible-roles", "GET", "V3 Get Eligible Roles", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-list-internal-users", "GET", "V3 Get a List of Internal Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-create-internal-user", "GET", "V3 Create Internal User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-internal-users", "GET", "V3 Bulk Update Internal Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-internal-user-profile", "GET", "V3 Get Internal User Profile", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-delete-internal-user-profile", "GET", "V3 Delete Internal User Profile", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-internal-user", "GET", "V3 Update Internal User", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-get-internal-user-public-profile", "GET", "V3 Get Internal User Public Profile", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-update-internal-user-public-profile", "GET", "V3 Update Internal User Public Profile", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v3-manage-internal-user-comp-plans", "GET", "V3 Manage Internal User Compensation Plans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/v1-contracts-10", "GET", "V1 Contracts", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-list-of-users", "GET", "V1 Get a List of Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-user-profile", "GET", "V1 Get a User Profile", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-list-of-user-groups", "GET", "V1 Get List of User Groups", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-compensation-plans", "GET", "V1 Get Compensation Plans", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-license-details", "GET", "V1 Get License Details", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-users-assigned-rights", "GET", "V1 Get User's Assigned Rights", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-users-effective-rights", "GET", "V1 Get User's Effective Rights", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/transformer", "GET", "Tools: Loan Transformer", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/export-loan-to-mismo-34", "GET", "Export Loan to MISMO 3.4", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/task-configuration", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-templates", "GET", "Manage Task Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-templates", "GET", "Get All Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-templates", "GET", "Update Task Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-template", "GET", "Create a Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-template-1", "GET", "Get a Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-template", "GET", "Update a Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-template", "GET", "Delete a Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-subtask-templates", "GET", "Manage Subtask Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-subtask-templates", "GET", "Get Subtask Templates", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-subtask-template", "GET", "Create a Subtask Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-subtask-template", "GET", "Get a Subtask Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-subtask-template", "GET", "Update a Subtask Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-subtask-template", "GET", "Delete a Subtask Template", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-workflow-v1-settings-task", "GET", "Manage Task Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-workflow-v1-settings-task", "GET", "Get Task Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-task-settings", "GET", "Update Task Settings", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/field-search", "GET", "Search for Field or Form", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/search-for-field-form", "GET", "Search for Field or Form", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/webhook", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-resources-events", "GET", "Resources and Events", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-loan", "GET", "Loan", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-doc-delivery", "GET", "Document Delivery", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-doc-order", "GET", "Document Order", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-enhanced-conditions", "GET", "Enhanced Conditions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-orgs-users", "GET", "Orgs and Users", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-partner-connect", "GET", "EPC", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-schedulers", "GET", "Schedulers", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-trades", "GET", "Trades", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-workflow-tasks", "GET", "Workflow Tasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-re-cat-dda", "GET", "DDA", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-retry-logic", "GET", "Retry Logic", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/wbhks-access-controls", "GET", "Access Controls", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/custom-authorization", "GET", "Custom Authentication", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/signing-keys", "GET", "Signing Keys", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/webhook-endpoints", "GET", "Endpoint Requirements", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/webhook-event-payload-attributes", "GET", "Webhook Event Payload Attributes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/default-payload-attributes", "GET", "Default Payload Attributes", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-doc-delivery", "GET", "Extra Payload Attributes - Document Delivery", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-documentorder", "GET", "Extra Payload Attributes - DocumentOrder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-loan-resources", "GET", "Extra Payload Attributes - Loan Resources", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-enhancedconditiontemplate", "GET", "Extra Payload Attributes - EnhancedConditionTemplate", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-enhancedconditiontype", "GET", "Extra Payload Attributes - EnhancedConditionType", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-externalusers", "GET", "Extra Payload Attributes - ExternalUsers", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-internalusers", "GET", "Extra Payload Attributes - InternalUsers", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-serviceorder", "GET", "Extra Payload Attributes - ServiceOrder", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-subtask", "GET", "Extra Payload Attributes - SubTask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-task", "GET", "Extra Payload Attributes - Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-taskcomment", "GET", "Extra Payload Attributes - TaskComment", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-taskgroup", "GET", "Extra Payload Attributes - TaskGroup", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-timer", "GET", "Extra Payload Attributes - Timer", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-trade", "GET", "Extra Payload Attributes - Trade", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/extra-payload-attributes-usergroup", "GET", "Extra Payload Attributes - UserGroup", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-resources", "GET", "Resources", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-resources", "GET", "Get All Resources", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-resource", "GET", "Get a Resource", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-resource-events", "GET", "Get Resource Events", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/subscriptions", "GET", "Subscriptions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-all-subscriptions", "GET", "Get All Subscriptions", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-subscription", "GET", "Create a Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-subscription", "GET", "Update Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-subscription", "GET", "Get a Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-subscription", "GET", "Delete Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/202-get-all-events", "GET", "Event History", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/202-get-all-events", "GET", "Get All Events", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-an-event", "GET", "Get an Event", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/overview", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/post_webhook-v1-functions-auth", "GET", "Create Webhook Custom Auth Function", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/post_webhook-v1-functions-auth", "GET", "Create Webhook Custom Auth Function", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get_webhook-v1-functions-auth", "GET", "Get Webhook Custom Auth Function List", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/put_webhook-v1-functions-auth-functionid", "GET", "Manage Webhook Custom Auth", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/put_webhook-v1-functions-auth-functionid", "GET", "Update Webhook Custom Auth Function", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete_webhook-v1-functions-auth-functionid", "GET", "Delete Webhook Custom Auth Function", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/patch_webhook-v1-functions-auth-functionid", "GET", "Update Webhook Custom Auth Credentials", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/patch_webhook-v1-subscriptions-subscriptionid-functions-auth-functionid", "GET", "Manage Custom Auth Linking to Webhook Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/patch_webhook-v1-subscriptions-subscriptionid-functions-auth-functionid", "GET", "Link Custom Auth Function to Webhook Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete_webhook-v1-subscriptions-subscriptionid-functions-auth-functionid", "GET", "Remove Custom Auth Function from Webhook Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get_webhook-v1-subscriptions-subscriptionid-functions-auth", "GET", "Get Custom Auth Functions for Webhook Subscription", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/post_webhook-v1-functions-auth-functionid-test", "GET", "Test Webhook Custom Auth", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/post_webhook-v1-functions-auth-functionid-test", "GET", "Test Webhook Custom Auth Parameters", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/overview-copy", "GET", "Overview", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-tasks", "GET", "Manage Tasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-tasks", "GET", "Get All Tasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-task", "GET", "Create a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-tasks", "GET", "Update All Tasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-task", "GET", "Get a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-task", "GET", "Delete a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-task", "GET", "Update a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/tasks-bulk-update", "GET", "Tasks Bulk Update", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-comments-for-a-task", "GET", "Get Comments for a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-a-comment-to-a-task", "GET", "Add a Comment to a Task", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-subtasks", "GET", "Manage Sub-Tasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-subtasks", "GET", "Get All Subtasks", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/create-a-subtask", "GET", "Create a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-a-subtask", "GET", "Get a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/update-a-task-1", "GET", "Update a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/delete-a-subtask", "GET", "Delete a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-comments-for-a-subtask", "GET", "Get Comments for a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/add-a-comment-to-a-subtask", "GET", "Add a Comment to a Subtask", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-task-pipeline", "GET", "Task Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");
    await upsertEndpoint(icePlatform.id, "/v1/get-task-pipeline", "GET", "Get Task Pipeline", "ICE Mortgage Technology API endpoint.", "ICE APIs");

    // ════════════════════════════════════════════
    // KEY PARAMETERS
    // ════════════════════════════════════════════

    // Encompass params
    const loanIdParam = await upsertParam(loanGet.id, "loanId", "string (UUID)", "path", true, "The unique GUID identifier of the loan.");
    const instanceIdParam = await upsertParam(tokenPost.id, "instance_id", "string", "body", true, "The Encompass instance identifier for your organization.");
    await upsertParam(tokenPost.id, "client_id", "string", "body", true, "OAuth2 client ID issued by ICE Mortgage Technology.");
    await upsertParam(tokenPost.id, "client_secret", "string", "body", true, "OAuth2 client secret. Keep this value secure.");

    await upsertParam(loanPatch.id, "loanId", "string (UUID)", "path", true, "The unique GUID identifier of the loan to update.");
    await upsertParam(loanPatch.id, "body", "object", "body", true, "JSON payload containing only the specific loan fields to update.");

    await upsertParam(docPost.id, "loanId", "string (UUID)", "path", true, "Loan GUID to attach the document to.");
    await upsertParam(docPost.id, "action", "string", "query", false, "Use 'add' to append an attachment. Default is 'add'.");

    await upsertParam(loanPipeline.id, "filter", "object", "body", false, "Filter criteria defining the search conditions (e.g., terms, operator).");
    await upsertParam(loanPipeline.id, "fields", "array", "body", false, "Array of specific field names to return in the pipeline search results.");

    await upsertParam(cdoPut.id, "loanId", "string (UUID)", "path", true, "Loan GUID associated with the CDO.");
    const cdoObjectNameParam = await upsertParam(cdoPut.id, "objectName", "string", "path", true, "The name of the Custom Data Object (e.g., 'MyCustomData.json').");
    await upsertParam(cdoPut.id, "file", "string (Base64)", "body", true, "Base-64 encoded string representing the file payload.");

    await prisma.parameterGuide.upsert({
        where: { parameterId: cdoObjectNameParam.id },
        create: {
            parameterId: cdoObjectNameParam.id,
            markdown: `## Working with Custom Data Objects (CDOs)

CDOs are unstructured data files (e.g., JSON, XML, TXT) that you can attach to a loan or globally to the Encompass system.

### Naming Conventions
- Avoid spaces and special characters. 
- Using extensions like \`.json\` or \`.xml\` is best practice for clarity.
- E.g., \`VendorResponse_123.json\`

### Reading CDOs
To read a CDO back:
1. Call \`GET /encompass/v3/loans/{loanId}/customDataObjects/{objectName}\`
2. The response is a Base64 string.
3. Decode the string in your application to read the original data.

### Example Payload
\`\`\`json
{
  "file": "eyAiSGVsbG8iOiAiV29ybGQiIH0=" // Base64 for '{ "Hello": "World" }'
}
\`\`\``,
        },
        update: {},
    });

    const webhookBodyParam = await upsertParam(webhookCreate.id, "events", "array", "body", true, "List of events to subscribe to (e.g., 'create', 'update').");
    await upsertParam(webhookCreate.id, "endpoint", "string (URL)", "body", true, "The HTTPS URL where Encompass should send webhook payloads.");

    await prisma.parameterGuide.upsert({
        where: { parameterId: webhookBodyParam.id },
        create: {
            parameterId: webhookBodyParam.id,
            markdown: `## Encompass Webhooks

Automate your workflow by subscribing to loan events instead of polling the API. Only HTTPS endpoints are supported.

### Common Subscription Events
- \`update\` : Triggers when any tracked loan field changes.
- \`create\` : Triggers on new loan creation.
- \`milestoneComplete\` : Triggers when a loan milestone is finished.

### Example Payload Setup
\`\`\`json
{
  "endpoint": "https://api.yourdomain.com/webhooks/encompass",
  "events": ["update"],
  "resource": "loan"
}
\`\`\`

> **Security Tip**: Encompass sends an \`Encompass-Signature\` header with every webhook delivery. Always verify the signature using your Client Secret to ensure the payload is authentic.`,
        },
        update: {},
    });

    // Microsoft Graph params
    const tenantIdParam = await upsertParam(usersGet.id, "tenant_id", "string (UUID)", "header", true, "Your Azure AD Tenant ID, used in the auth URL.");
    const userIdParam = await upsertParam(sendMail.id, "userId", "string", "path", true, "The user's object ID or UPN (e.g., user@domain.com).");
    await upsertParam(sendMail.id, "message", "object", "body", true, "The message object containing subject, body, and toRecipients.");
    await upsertParam(teamsMessage.id, "teamId", "string (UUID)", "path", true, "The ID of the Microsoft Teams team.");
    await upsertParam(teamsMessage.id, "channelId", "string", "path", true, "The ID of the channel within the team.");

    // Google params
    await upsertParam(gmailList.id, "userId", "string", "path", true, "The user's email address or 'me' for the authenticated user.");
    await upsertParam(gmailList.id, "q", "string", "query", false, "Gmail search query (e.g., 'is:unread from:boss@company.com').");
    await upsertParam(sheetsRead.id, "spreadsheetId", "string", "path", true, "The ID of the Google Sheets spreadsheet (from the URL).");
    await upsertParam(sheetsRead.id, "range", "string", "path", true, "The A1 notation of the range to retrieve (e.g., 'Sheet1!A1:D10').");

    // Stripe params
    const stripeCustomers = await prisma.endpoint.findFirst({ where: { platformId: stripe.id, path: "/payment_intents", method: "POST" } });
    if (stripeCustomers) {
        await upsertParam(stripeCustomers.id, "amount", "integer", "body", true, "Amount in the smallest currency unit (e.g., cents for USD). 1000 = $10.00.");
        await upsertParam(stripeCustomers.id, "currency", "string", "body", true, "Three-letter ISO currency code (e.g., 'usd', 'eur').");
        await upsertParam(stripeCustomers.id, "customer", "string", "body", false, "The ID of the customer this PaymentIntent belongs to.");
    }

    // Twilio params
    const smsEndpoint = await prisma.endpoint.findFirst({ where: { platformId: twilio.id, method: "POST", path: { contains: "Messages" } } });
    if (smsEndpoint) {
        const accountSidParam = await upsertParam(smsEndpoint.id, "AccountSid", "string", "path", true, "Your Twilio Account SID, found on the Twilio Console dashboard.");
        await upsertParam(smsEndpoint.id, "To", "string", "body", true, "Destination phone number in E.164 format (e.g., +14155552671).");
        await upsertParam(smsEndpoint.id, "From", "string", "body", true, "Your Twilio phone number in E.164 format.");
        await upsertParam(smsEndpoint.id, "Body", "string", "body", true, "The text message body. Max 1600 characters (split into segments if over 160).");

        // Guide for AccountSid
        await prisma.parameterGuide.upsert({
            where: { parameterId: accountSidParam.id },
            create: {
                parameterId: accountSidParam.id,
                markdown: `## How to Find Your Twilio Account SID

The Account SID is a 34-character string starting with \`AC\`. It's your primary Twilio account identifier.

### Via Twilio Console
1. Log in to [console.twilio.com](https://console.twilio.com)
2. Your **Account SID** is displayed on the main **Dashboard** page under "Account Info"
3. Click the copy icon to copy it to your clipboard

### As an Environment Variable
\`\`\`bash
export TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export TWILIO_AUTH_TOKEN="your_auth_token"
\`\`\`

### In Code
\`\`\`python
from twilio.rest import Client

client = Client(
    os.environ["TWILIO_ACCOUNT_SID"],
    os.environ["TWILIO_AUTH_TOKEN"]
)
\`\`\`

> **Security**: Never commit your Account SID or Auth Token to source control. Use environment variables or a secrets manager.`,
            },
            update: {},
        });
    }

    // OpenAI params
    const chatEndpoint = await prisma.endpoint.findFirst({ where: { platformId: openai.id, path: "/chat/completions" } });
    if (chatEndpoint) {
        const modelParam = await upsertParam(chatEndpoint.id, "model", "string", "body", true, "ID of the model to use (e.g., 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo').");
        await upsertParam(chatEndpoint.id, "messages", "array", "body", true, "Array of message objects with 'role' (system/user/assistant) and 'content' fields.");
        await upsertParam(chatEndpoint.id, "temperature", "number", "body", false, "Sampling temperature 0–2. Higher = more random. Default 1. Use 0 for deterministic output.");
        await upsertParam(chatEndpoint.id, "max_tokens", "integer", "body", false, "Maximum number of tokens to generate. One token ≈ 4 characters in English.");
        await upsertParam(chatEndpoint.id, "stream", "boolean", "body", false, "If true, sends partial message deltas as server-sent events (SSE).");

        await prisma.parameterGuide.upsert({
            where: { parameterId: modelParam.id },
            create: {
                parameterId: modelParam.id,
                markdown: `## Choosing the Right OpenAI Model

| Model | Context | Best For |
|-------|---------|----------|
| \`gpt-4o\` | 128K tokens | Best quality, multimodal (text + images) |
| \`gpt-4-turbo\` | 128K tokens | High quality, fast, cost-effective |
| \`gpt-3.5-turbo\` | 16K tokens | Fast, cheap, good for simple tasks |
| \`text-embedding-3-large\` | 8K tokens | High-dimensional embeddings |
| \`dall-e-3\` | — | Image generation |
| \`whisper-1\` | — | Audio transcription |
| \`tts-1\` | — | Text-to-speech |

### Finding Available Models
\`\`\`bash
curl https://api.openai.com/v1/models \\
  -H "Authorization: Bearer $OPENAI_API_KEY"
\`\`\`

### Pricing Tip
Use \`gpt-3.5-turbo\` for prototyping and switch to \`gpt-4o\` only for production tasks requiring higher accuracy.

> **Note**: Model availability may vary by account tier and region. Check [platform.openai.com](https://platform.openai.com/docs/models) for the latest list.`,
            },
            update: {},
        });
    }

    // Plaid params
    const linkEndpoint = await prisma.endpoint.findFirst({ where: { platformId: plaid.id, path: "/link/token/create" } });
    if (linkEndpoint) {
        await upsertParam(linkEndpoint.id, "client_id", "string", "body", true, "Your Plaid client_id from the Plaid Dashboard.");
        await upsertParam(linkEndpoint.id, "secret", "string", "body", true, "Your Plaid API secret for the target environment (sandbox/production).");
        const userParam = await upsertParam(linkEndpoint.id, "user", "object", "body", true, "End-user object with client_user_id for tracking unique users.");
        await upsertParam(linkEndpoint.id, "products", "array", "body", true, "List of Plaid products to request (e.g., ['transactions', 'auth', 'identity']).");

        await prisma.parameterGuide.upsert({
            where: { parameterId: userParam.id },
            create: {
                parameterId: userParam.id,
                markdown: `## The Plaid \`user\` Object

The \`user\` parameter identifies the end-user connecting their bank account and is used for deduplication and fraud prevention.

### Required Structure
\`\`\`json
{
  "user": {
    "client_user_id": "unique-user-id-from-your-system"
  }
}
\`\`\`

### Optional Fields
\`\`\`json
{
  "user": {
    "client_user_id": "user-123",
    "legal_name": "Jane Doe",
    "email_address": "jane@example.com",
    "phone_number": "+14155550123"
  }
}
\`\`\`

### client_user_id Guidelines
- **Must be unique** per user in your system (e.g., your database user ID)  
- Should remain **stable** across sessions for the same user
- Do NOT use PII (name, email) directly — use an opaque internal ID
- Max 36 characters

> **Tip**: Storing the same \`client_user_id\` across Link sessions allows Plaid to recognize returning users and skip re-authentication in some flows.`,
            },
            update: {},
        });
    }

    // Stripe PaymentIntent params guide
    const stripePaymentIntent = await prisma.endpoint.findFirst({ where: { platformId: stripe.id, path: "/payment_intents", method: "POST" } });
    if (stripePaymentIntent) {
        const amountParam = await prisma.parameter.findFirst({ where: { endpointId: stripePaymentIntent.id, name: "amount" } });
        if (amountParam) {
            await prisma.parameterGuide.upsert({
                where: { parameterId: amountParam.id },
                create: {
                    parameterId: amountParam.id,
                    markdown: `## Understanding Stripe \`amount\` (Smallest Currency Unit)

Stripe always uses the **smallest currency unit** to avoid floating point issues.

### Conversion Table
| Currency | 1 unit = | To charge $10.00 |
|----------|---------|-----------------|
| USD | $0.01 (1 cent) | \`amount: 1000\` |
| EUR | €0.01 | \`amount: 1000\` |
| GBP | £0.01 | \`amount: 1000\` |
| JPY | ¥1 (zero-decimal) | \`amount: 1000\` |

### Zero-Decimal Currencies
Some currencies (JPY, KRW, etc.) have no minor units. For these, \`amount: 1000\` = ¥1000.

\`\`\`python
# Python helper
def to_stripe_amount(dollars: float, currency: str = "usd") -> int:
    zero_decimal = {"jpy", "krw", "vnd"}
    if currency.lower() in zero_decimal:
        return int(dollars)
    return int(round(dollars * 100))
\`\`\`

> **Important**: Always validate the amount server-side. Never trust client-side price calculations.`,
                },
                update: {},
            });
        }
    }

    // GitHub params
    const issueEndpoint = await prisma.endpoint.findFirst({ where: { platformId: github.id, path: "/repos/{owner}/{repo}/issues", method: "POST" } });
    if (issueEndpoint) {
        await upsertParam(issueEndpoint.id, "owner", "string", "path", true, "The GitHub account or organization that owns the repository.");
        await upsertParam(issueEndpoint.id, "repo", "string", "path", true, "The repository name (without the .git extension).");
        await upsertParam(issueEndpoint.id, "title", "string", "body", true, "The title of the issue.");
        await upsertParam(issueEndpoint.id, "body", "string", "body", false, "The body content of the issue. Supports GitHub Flavored Markdown.");
        await upsertParam(issueEndpoint.id, "labels", "array", "body", false, "Labels to associate with this issue. Must already exist in the repository.");
        await upsertParam(issueEndpoint.id, "assignees", "array", "body", false, "Logins for users to assign the issue to. Limited to 10 assignees.");
    }

    // DocuSign params
    const envelopeEndpoint = await prisma.endpoint.findFirst({ where: { platformId: docusign.id, path: "/accounts/{accountId}/envelopes", method: "POST" } });
    if (envelopeEndpoint) {
        const accountIdParam = await upsertParam(envelopeEndpoint.id, "accountId", "string (UUID)", "path", true, "Your DocuSign Account ID (GUID format).");
        await upsertParam(envelopeEndpoint.id, "emailSubject", "string", "body", true, "Subject line of the email sent to signers.");
        await upsertParam(envelopeEndpoint.id, "documents", "array", "body", true, "Array of document objects to include in the envelope.");
        await upsertParam(envelopeEndpoint.id, "recipients", "object", "body", true, "Object defining who needs to sign, view, or receive a copy.");
        await upsertParam(envelopeEndpoint.id, "status", "string", "body", true, "Use 'sent' to send immediately or 'created' to save as draft.");

        await prisma.parameterGuide.upsert({
            where: { parameterId: accountIdParam.id },
            create: {
                parameterId: accountIdParam.id,
                markdown: `## How to Find Your DocuSign Account ID

The Account ID (also called API Account ID) is a UUID that identifies your DocuSign account.

### Via DocuSign Admin Panel
1. Log in to [app.docusign.com](https://app.docusign.com) or your eSign account
2. Click your **profile icon** in the top right → **Go to My Account** (or **Go to Admin**)
3. Navigate to **Settings** → **Integrations** → **Apps and Keys**
4. Your **API Account ID** is listed at the top of the page

### Via the /userinfo Endpoint
After obtaining an OAuth2 token:
\`\`\`bash
curl -X GET "https://account.docusign.com/oauth/userinfo" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`
The response includes \`accounts[].account_id\`.

### Demo vs Production
| Environment | Base URL |
|------------|---------|
| Demo (Sandbox) | \`https://demo.docusign.net/restapi/v2.1\` |
| Production | \`https://www.docusign.net/restapi/v2.1\` |

> **Tip**: Store your Account ID in \`DOCUSIGN_ACCOUNT_ID\` environment variable.`,
            },
            update: {},
        });
    }

    // Salesforce params
    const sfQueryEndpoint = await prisma.endpoint.findFirst({ where: { platformId: salesforce.id, path: "/query" } });
    if (sfQueryEndpoint) {
        const soqlParam = await upsertParam(sfQueryEndpoint.id, "q", "string", "query", true, "A SOQL query string (e.g., SELECT Id, Name FROM Account LIMIT 10).");

        await prisma.parameterGuide.upsert({
            where: { parameterId: soqlParam.id },
            create: {
                parameterId: soqlParam.id,
                markdown: `## Writing SOQL Queries for the Salesforce API

SOQL (Salesforce Object Query Language) is similar to SQL but operates on Salesforce objects.

### Basic Syntax
\`\`\`sql
SELECT field1, field2
FROM ObjectName
WHERE Condition
ORDER BY field1 ASC
LIMIT 100
\`\`\`

### Common Examples
\`\`\`sql
-- Get open opportunities over $50K
SELECT Id, Name, Amount, CloseDate, StageName
FROM Opportunity
WHERE Amount > 50000 AND StageName != 'Closed Lost'
ORDER BY CloseDate ASC
LIMIT 200

-- Get contacts from a specific account
SELECT Id, FirstName, LastName, Email
FROM Contact
WHERE AccountId = '001XXXXXXXXXXXXXXX'

-- Get recently modified leads
SELECT Id, Name, Email, Status
FROM Lead
WHERE LastModifiedDate = LAST_N_DAYS:7
\`\`\`

### URL Encoding
When using the REST API, URL-encode the query:
\`\`\`bash
curl "https://{instance}.salesforce.com/services/data/v58.0/query?q=SELECT+Id,Name+FROM+Account+LIMIT+10" \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

> **Limits**: SOQL returns max 2,000 records per call. Use \`nextRecordsUrl\` from the response to paginate.`,
            },
            update: {},
        });
    }

    // Zendesk params
    const zdTicketCreate = await prisma.endpoint.findFirst({ where: { platformId: zendesk.id, path: "/tickets.json", method: "POST" } });
    if (zdTicketCreate) {
        await upsertParam(zdTicketCreate.id, "ticket[subject]", "string", "body", true, "The subject line of the ticket.");
        await upsertParam(zdTicketCreate.id, "ticket[comment][body]", "string", "body", true, "The body of the initial comment/description.");
        await upsertParam(zdTicketCreate.id, "ticket[priority]", "string", "body", false, "Ticket priority: 'urgent', 'high', 'normal', or 'low'.");
        await upsertParam(zdTicketCreate.id, "ticket[requester][email]", "string", "body", false, "Email of the requester. Creates a user if they don't exist.");
    }

    // Shopify params
    const shopifyOrders = await prisma.endpoint.findFirst({ where: { platformId: shopify.id, path: "/orders.json", method: "GET" } });
    if (shopifyOrders) {
        await upsertParam(shopifyOrders.id, "status", "string", "query", false, "Filter by order status: 'open', 'closed', 'cancelled', or 'any'.");
        await upsertParam(shopifyOrders.id, "limit", "integer", "query", false, "Maximum number of results per page. Default 50, max 250.");
        await upsertParam(shopifyOrders.id, "created_at_min", "string (ISO8601)", "query", false, "Return orders created after this date/time (e.g., '2024-01-01T00:00:00-05:00').");
        await upsertParam(shopifyOrders.id, "financial_status", "string", "query", false, "Filter by payment status: 'paid', 'pending', 'refunded', 'partially_refunded'.");
    }

    // ════════════════════════════════════════════
    // ORIGINAL GUIDES (preserved)
    // ════════════════════════════════════════════
    await prisma.parameterGuide.upsert({
        where: { parameterId: loanIdParam.id },
        create: {
            parameterId: loanIdParam.id,
            markdown: `## How to Find Your Loan GUID (loanId)

The \`loanId\` is a globally unique identifier (GUID) assigned to every loan in Encompass. It looks like: \`3f7a1b2c-4d5e-6f78-9012-abcdef123456\`

### Method 1: Encompass SmartClient (Desktop)
1. Open the loan in Encompass SmartClient
2. Navigate to **Tools** → **Loan Information**
3. The **Loan GUID** field displays the identifier

### Method 2: Encompass Web (Browser)
1. Open the loan in Encompass Web
2. Look at the browser URL — the GUID is embedded in the path:
   \`\`\`
   https://your-instance.elliemae.com/loans/3f7a1b2c-4d5e-6f78-9012-abcdef123456
   \`\`\`

### Method 3: Loan Pipeline Search API
\`\`\`json
POST /encompass/v3/loanPipeline
{
  "filter": {
    "operator": "and",
    "terms": [{ "fieldName": "Loan.LoanNumber", "matchType": "exact", "value": "0001234" }]
  },
  "fields": ["Loan.GUID"]
}
\`\`\`

> **Note**: Store GUIDs in your database rather than loan numbers for reliable cross-system references.`,
        },
        update: {},
    });

    await prisma.parameterGuide.upsert({
        where: { parameterId: tenantIdParam.id },
        create: {
            parameterId: tenantIdParam.id,
            markdown: `## How to Find Your Azure AD Tenant ID

The Tenant ID is a GUID that uniquely identifies your Microsoft 365 / Azure AD organization.

### Via Azure Portal
1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Search for **"Azure Active Directory"**
3. In the left sidebar, click **Overview**
4. Your **Tenant ID** is displayed under "Basic information"

### Via Microsoft Graph
\`\`\`
GET https://graph.microsoft.com/v1.0/organization
\`\`\`
The response contains \`"id"\` which is your Tenant ID.

### In the Auth URL
\`\`\`
https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
\`\`\`

> **Tip**: Your Tenant ID never changes. Save it as \`AZURE_TENANT_ID\`.`,
        },
        update: {},
    });

    await prisma.parameterGuide.upsert({
        where: { parameterId: instanceIdParam.id },
        create: {
            parameterId: instanceIdParam.id,
            markdown: `## How to Find Your Encompass Instance ID

The Instance ID identifies your company's specific Encompass environment (e.g., \`BE11223344\`).

### Method 1: Encompass Settings
1. Log in to Encompass SmartClient
2. Go to **Encompass** → **Settings** → **Company/System Settings**
3. Look for **Server/Instance ID**

### Method 2: From Your Admin
Your Encompass administrator has this from initial provisioning documents from ICE Mortgage Technology.

> **Important**: Never hardcode instance IDs in code. Use environment variables: \`ENCOMPASS_INSTANCE_ID\``,
        },
        update: {},
    });

    const counts = {
        platforms: await prisma.platform.count(),
        endpoints: await prisma.endpoint.count(),
        parameters: await prisma.parameter.count(),
        guides: await prisma.parameterGuide.count(),
    };

    console.log("✅ Database seeded successfully!");
    console.log(`  🏢 Platforms : ${counts.platforms}`);
    console.log(`  🔗 Endpoints : ${counts.endpoints}`);
    console.log(`  📋 Parameters: ${counts.parameters}`);
    console.log(`  📖 Guides    : ${counts.guides}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
