import { Chrome, Facebook, Github, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Navigate, ThirdPartyProvider } from "../types";

export type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterPayload = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  marketingOptIn: boolean;
};

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const thirdPartyProviders = [
  {
    id: "google",
    label: "Google",
    icon: Chrome
  },
  {
    id: "github",
    label: "GitHub",
    icon: Github
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook
  }
] satisfies Array<{
  id: ThirdPartyProvider;
  label: string;
  icon: typeof Chrome;
}>;

function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="auth-benefits">
          <div>
            <ShieldCheck size={20} />
            <span>JWT access token, refresh token và route cần đăng nhập.</span>
          </div>
          <div>
            <LockKeyhole size={20} />
            <span>Mật khẩu sẽ được hash ở Auth Service khi nối backend.</span>
          </div>
          <div>
            <Mail size={20} />
            <span>Profile người dùng sẽ thuộc User Service, tách khỏi Auth Service.</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">{children}</section>
    </main>
  );
}

type ThirdPartyAuthProps = {
  action: "login" | "register";
  onThirdPartyAuth: (provider: ThirdPartyProvider) => void;
};

function ThirdPartyAuth({ action, onThirdPartyAuth }: ThirdPartyAuthProps) {
  const actionLabel = action === "login" ? "Tiếp tục với" : "Đăng ký với";

  return (
    <section className="third-party-auth">
      <div className="auth-divider">
        <span>hoặc</span>
      </div>
      <div className="third-party-grid">
        {thirdPartyProviders.map((provider) => {
          const Icon = provider.icon;

          return (
            <button
              className={`third-party-button provider-${provider.id}`}
              key={provider.id}
              type="button"
              onClick={() => onThirdPartyAuth(provider.id)}
            >
              <Icon size={18} />
              <span>
                {actionLabel} {provider.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type LoginPageProps = {
  initialNotice?: string;
  onLogin: (payload: LoginPayload) => void | Promise<void>;
  onThirdPartyAuth: (provider: ThirdPartyProvider) => void;
  onNavigate: Navigate;
};

export function LoginPage({ initialNotice, onLogin, onThirdPartyAuth, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState(initialNotice ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setNotice("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      await onLogin({ email: email.trim(), password, remember });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Đăng nhập"
      title="Chào mừng bạn quay lại GreenNest"
      description="Đăng nhập để quản lý hồ sơ, địa chỉ giao hàng, giỏ hàng và lịch sử đơn hàng trong luồng microservices."
    >
      <div className="auth-heading">
        <KeyRound size={24} />
        <div>
          <h2>Đăng nhập</h2>
          <p>Form này gọi `POST /api/auth/login` qua API Gateway.</p>
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>

        <label className="field">
          <span>Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
          />
        </label>

        <div className="inline-options">
          <label>
            <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
            Ghi nhớ phiên đăng nhập
          </label>
          <button type="button" onClick={() => onNavigate("/forgot-password")}>
            Quên mật khẩu?
          </button>
        </div>

        <button className="submit-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang đăng nhập" : "Đăng nhập"}
        </button>
      </form>

      <ThirdPartyAuth action="login" onThirdPartyAuth={onThirdPartyAuth} />

      <p className="switch-line">
        Chưa có tài khoản?
        <button type="button" onClick={() => onNavigate("/register")}>
          Tạo tài khoản mới
        </button>
      </p>
    </AuthShell>
  );
}

type RegisterPageProps = {
  onRegister: (payload: RegisterPayload) => void | Promise<void>;
  onThirdPartyAuth: (provider: ThirdPartyProvider) => void;
  onNavigate: Navigate;
};

export function RegisterPage({ onRegister, onThirdPartyAuth, onNavigate }: RegisterPageProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setNotice("Vui lòng nhập đủ họ tên, username, email và mật khẩu.");
      return;
    }

    if (password.length < 8) {
      setNotice("Mật khẩu demo cần tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setNotice("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      await onRegister({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        marketingOptIn
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Đăng ký thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Tạo tài khoản"
      title="Bắt đầu mua sắm an toàn hơn"
      description="Trang đăng ký mô phỏng luồng Auth Service tạo account, sau đó User Service tạo hồ sơ cá nhân."
    >
      <div className="auth-heading">
        <UserPlus size={24} />
        <div>
          <h2>Đăng ký</h2>
          <p>Form này gọi `POST /api/auth/register` qua API Gateway.</p>
        </div>
      </div>

      {notice ? <div className="notice">{notice}</div> : null}

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="two-column-fields">
          <label className="field">
            <span>Họ tên</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <div className="two-column-fields">
          <label className="field">
            <span>Mật khẩu</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="field">
            <span>Xác nhận</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>

        <label className="check-row">
          <input
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            type="checkbox"
          />
          Nhận thông tin khuyến mãi và thông báo đơn hàng.
        </label>

        <button className="submit-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang tạo tài khoản" : "Tạo tài khoản"}
        </button>
      </form>

      <ThirdPartyAuth action="register" onThirdPartyAuth={onThirdPartyAuth} />

      <p className="switch-line">
        Đã có tài khoản?
        <button type="button" onClick={() => onNavigate("/login")}>
          Đăng nhập
        </button>
      </p>
    </AuthShell>
  );
}

type ForgotPasswordPageProps = {
  onNavigate: Navigate;
};

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("demo@greennest.local");
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setNotice("Vui lòng nhập email cần khôi phục.");
      return;
    }

    setNotice("Đã tạo yêu cầu reset mật khẩu demo. Khi có backend, bước này sẽ gửi email hoặc OTP.");
  }

  return (
    <AuthShell
      eyebrow="Khôi phục"
      title="Reset mật khẩu ở mức demo"
      description="MVP chưa gửi email thật, nhưng vẫn có màn hình để mô tả đầy đủ luồng bảo mật tài khoản."
    >
      <div className="auth-heading">
        <Mail size={24} />
        <div>
          <h2>Quên mật khẩu</h2>
          <p>Sau này sẽ map sang endpoint reset password của Auth Service.</p>
        </div>
      </div>

      {notice ? <div className="notice success">{notice}</div> : null}

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <button className="submit-button" type="submit">
          Gửi yêu cầu reset
        </button>
      </form>

      <p className="switch-line">
        Nhớ mật khẩu rồi?
        <button type="button" onClick={() => onNavigate("/login")}>
          Quay lại đăng nhập
        </button>
      </p>
    </AuthShell>
  );
}

type GoogleCallbackPageProps = {
  onComplete: (code: string, state: string) => void | Promise<void>;
  onNavigate: Navigate;
};

export function GoogleCallbackPage({ onComplete, onNavigate }: GoogleCallbackPageProps) {
  const [message, setMessage] = useState("Đang xử lý phản hồi từ Google...");
  const hasStartedCallback = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");
    const state = params.get("state");

    if (error) {
      setMessage(`Google trả về lỗi: ${error}`);
      return;
    }

    if (!code || !state) {
      setMessage("Không tìm thấy mã xác thực Google trong URL callback.");
      return;
    }

    if (hasStartedCallback.current) {
      return;
    }

    hasStartedCallback.current = true;

    window.setTimeout(() => {
      void Promise.resolve(onComplete(code, state)).catch((callbackError) => {
        setMessage(callbackError instanceof Error ? callbackError.message : "Đăng nhập Google thất bại.");
      });
    }, 500);
  }, [onComplete]);

  return (
    <AuthShell
      eyebrow="Google OAuth"
      title="Đang hoàn tất đăng nhập Google"
      description="Frontend nhận authorization code từ Google, gửi qua API Gateway, rồi Auth Service đổi code lấy thông tin tài khoản thật."
    >
      <div className="auth-heading">
        <Chrome size={24} />
        <div>
          <h2>Google callback</h2>
          <p>{message}</p>
        </div>
      </div>
      <button className="secondary-button auth-return-button" type="button" onClick={() => onNavigate("/login")}>
        Quay lại đăng nhập
      </button>
    </AuthShell>
  );
}
