/** @see https://api.testmail.app/api/graphql */

/** Object containing the result of the inbox retrieval request. */
interface Inbox {
  /** Whether or not the inbox retrieval request was successful. */
  result: Outcome

  /** If the request failed, this message will detail why. */
  message: String

  /** The number of emails that matched your query. */
  count: number

  /** The number of emails retrieved based on the limit parameter of your query (this is useful for pagination). */
  limit: number

  /** The number of emails offset based on the offset parameter of your query (this is useful for pagination). */
  offset: number

  /** Array of matching emails from the inbox. */
  emails: Email[]
}

/** OUTPUT TYPES */
declare enum Outcome {
  /**  */
  success,

  /**  */
  fail
}

/** Email object (for emails in the inbox). */
interface Email {
  /** This is the unique id (and primary key) for the email in our database. */
  id: string

  /** The namespace at which this email was received - remember that emails are sent to {namespace}.{tag}@inbox.testmail.app */
  namespace: string

  /** The custom tag (mailbox) at which this email was received - remember that emails are sent to {namespace}.{tag}@inbox.testmail.app */
  tag: string

  /**
   * Timestamp in milliseconds since January 1, 1970.
   * This is the timestamp on the server that stored and indexed the email at the time when it received the email from the SMTP server.
   * Note that this can differ from the "date" value available in the EmailParsed object.
   */
  timestamp: number

  /** The return path (from the SMTP envelope) */
  envelope_from: string

  /** The address at which we received this email (from the SMTP envelope) */
  envelope_to: string

  /**
   * The email sender parsed from the message headers.
   * Warning: this can be spoofed! (the sender specifies this header) vs. the from address in the SMTP envelope (see "envelope_from") which is harder to spoof.
   */
  from: string

  /** ...when you want the name and email parsed out (instead of a combined string) */
  from_parsed: ParsedAddress[]

  /**
   * The email recipient field parsed from the message headers.
   * Warning: this can be spoofed! (the sender specifies this header) vs. the to address in the SMTP envelope (see "envelope_to") which is harder to spoof.
   */
  to: string

  /** ...when you want the name and email parsed out for each to address (instead of a combined string with all addresses) */
  to_parsed: ParsedAddress[]

  /** The email cc field parsed from the message headers. */
  cc: string

  /** ...when you want the name and email parsed out for each to address (instead of a combined string with all addresses) */
  cc_parsed: ParsedAddress[]

  /** The subject line of the email parsed from the message headers. */
  subject: string

  /** Array of all email header lines. */
  headers: HeaderLine[]

  /**
   * Timestamp in milliseconds since January 1, 1970.
   * Extracted from the date header (might not be accurate).
   * This differs from "timestamp" which is recorded on the server side when parsing the email.
   */
  date: number

  /** The "Message-Id" header value */
  messageId: string

  /** Array of referenced "Message-Id" header values */
  references: string[]

  /**
   * The html body of the message.
   * If the html includes embedded images as cid: urls they are all replaced with base64 formatted data: URIs.
   */
  html: string

  /** The plaintext body of the message. */
  text: string

  /** Array of message attachments (if any) */
  attachments: Attachment[]

  /**
   * Whether the email passes the SPF (Sender Policy Framework) authentication check.
   * If the email fails this check, it might not be from the domain that it claims to be from.
   * This information is useful for spam filters.
   */
  SPF: string

  /**
   * Whether the email passes the DKIM (DomainKeys Identified Mail) authentication check.
   * If the email fails this check, it might not be from the domain that it claims to be from.
   * This information is useful for spam filters.
   */
  dkim: string

  /** The spam score (higher is bad). */
  spam_score: number

  /** The full spam scoring report. Useful information for improving deliverability. */
  spam_report: string

  /** The sender's IP address. */
  sender_ip: string

  /** Download the raw, full MIME message at this URL (hosted by testmail). This is useful if you want to use your own parser. */
  downloadUrl: string
}

/** Address object containing the parsed name and email address. */
interface ParsedAddress {
  /** The email address. */
  address: string

  /** The name part of the email. */
  name: string

  /** Array of grouped addresses. */
  group: string
}

/** HeaderLine object containing the parsed header line. */
interface HeaderLine {
  /** The lowercase header key (e.g. "content-type"). */
  key: string

  /** The full header line including the key (e.g. "Content-Type: text/plain; charset=us-ascii"). */
  line: string
}

/** Attachment object. */
interface Attachment {
  /** The name of the attachment */
  filename: string

  /** The MIME type of the message */
  contentType: string

  /** MD5 hash of the message content */
  checksum: string

  /** Message size in bytes */
  size: number

  /** Array of all attachment header lines */
  headers: HeaderLine[]

  /** Download the attachment at this URL (hosted by testmail) */
  downloadUrl: string

  /** The Content-Id header value (if present) */
  contentId: string

  /** The Content-Id without < and > */
  cid: string

  /**
   * If true then this attachment should not be offered for download
   * (at least not in the main attachments list)
   */
  related: boolean
}
