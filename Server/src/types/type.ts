export interface Form {
  pw: string;
  email: string;
  name: string;
  birth: string;
}

interface RequestJoin {
  userEmail: string;
  userPwd: string;
  userName: string;
  userBirth: string;
  inputAuth: string;
}

export interface RequestLogin {
  userEmail: string;
  userPwd: string;
}

export type EmailVerification = Partial<RequestJoin>;
