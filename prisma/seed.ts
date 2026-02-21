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
    const loanPatch = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}", "PATCH", "Update Loan Fields",
        "Partially updates a loan's field values. Only the fields provided in the request body will be modified.", "Loans");
    const loanCreate = await upsertEndpoint(encompass.id, "/encompass/v3/loans", "POST", "Create New Loan",
        "Creates a new loan in Encompass. Returns the newly created loan's GUID.", "Loans");
    const tokenPost = await upsertEndpoint(encompass.id, "/oauth2/v1/token", "POST", "Request OAuth2 Token",
        "Authenticates with the Encompass API and returns a bearer token. Requires client credentials and an instance ID.", "Authentication");
    const docPost = await upsertEndpoint(encompass.id, "/encompass/v3/loans/{loanId}/attachments", "POST", "Upload Loan Attachment",
        "Uploads a document attachment to a specific loan. Supports PDF, images, and other document types.", "Documents");
    const healthEncompass = await upsertEndpoint(encompass.id, "/encompass/v3/settings/systemConfiguration", "GET", "Health Check",
        "Returns current system configuration settings. Useful as a connectivity/auth check.", "Health");

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
    // KEY PARAMETERS
    // ════════════════════════════════════════════

    // Encompass params
    const loanIdParam = await upsertParam(loanGet.id, "loanId", "string (UUID)", "path", true, "The unique GUID identifier of the loan.");
    const instanceIdParam = await upsertParam(tokenPost.id, "instance_id", "string", "body", true, "The Encompass instance identifier for your organization.");
    await upsertParam(tokenPost.id, "client_id", "string", "body", true, "OAuth2 client ID issued by ICE Mortgage Technology.");
    await upsertParam(tokenPost.id, "client_secret", "string", "body", true, "OAuth2 client secret. Keep this value secure.");
    await upsertParam(loanPatch.id, "loanId", "string (UUID)", "path", true, "The unique GUID identifier of the loan to update.");
    await upsertParam(docPost.id, "loanId", "string (UUID)", "path", true, "Loan GUID to attach the document to.");

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
