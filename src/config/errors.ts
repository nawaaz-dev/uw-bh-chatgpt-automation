export namespace Errors {
  export enum Auth {
    CaptchaRequired = 'CaptchaRequired',
    TwoFactorRequired = 'TwoFactorRequired',
    AuthFailed = 'AuthFailed'
  }

  export enum Form {
    InvalidEmail = 'InvalidEmail',
    InvalidPassword = 'InvalidPassword',
    InvalidPrompt = 'InvalidPrompt',
    InvalidReply = 'InvalidReply'
  }

  export enum ElementNotFound {
    LoginButton = 'LoginButton',
    EmailInput = 'EmailInput',
    PasswordInput = 'PasswordInput',
    PasswordSubmitButton = 'PasswordSubmitButton',
    EmailSubmitButton = 'EmailSubmitButton',
    EmailVerificationInput = 'EmailVerificationInput',
    EmailVerificationSubmitButton = 'EmailVerificationSubmitButton',
    ChatInput = 'ChatInput',
    ChatSendButton = 'ChatSendButton',
    ChatResponse = 'ChatResponse',
    ChatResponeTimeout = 'ChatResponseTimeout'
  }

  export enum File {
    CSVCreateFailed = 'CSVCreateFailed',
    CSVWriteFailed = 'CSVWriteFailed'
  }

  export enum Generic {
    CookieLayover = 'CookieLayover'
  }
}
