import {
  BadgeCheck,
  CalendarDays,
  Home,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import type { Address, Navigate, RouteId, UserProfile } from "../types";

type AccountLayoutProps = {
  children: ReactNode;
  route: RouteId;
  user: UserProfile;
  onNavigate: Navigate;
};

const accountNav = [
  { label: "Hồ sơ", path: "/profile", route: "profile" },
  { label: "Chỉnh sửa hồ sơ", path: "/profile/edit", route: "editProfile" },
  { label: "Địa chỉ giao hàng", path: "/profile/addresses", route: "addresses" }
] satisfies Array<{ label: string; path: string; route: RouteId }>;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AccountLayout({ children, route, user, onNavigate }: AccountLayoutProps) {
  return (
    <main className="account-page">
      <aside className="account-sidebar">
        <div className="account-mini-profile">
          <div className="avatar">{getInitials(user.fullName)}</div>
          <div>
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <nav className="account-nav">
          {accountNav.map((item) => (
            <button
              className={route === item.route ? "active" : ""}
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="account-content">{children}</section>
    </main>
  );
}

type ProfilePageProps = {
  route: RouteId;
  user: UserProfile;
  onNavigate: Navigate;
};

export function ProfilePage({ route, user, onNavigate }: ProfilePageProps) {
  const defaultAddress = user.addresses.find((address) => address.isDefault) ?? user.addresses[0];

  return (
    <AccountLayout route={route} user={user} onNavigate={onNavigate}>
      <section className="account-hero">
        <div className="avatar large">{getInitials(user.fullName)}</div>
        <div>
          <span className="eyebrow">Tài khoản khách hàng</span>
          <h1>{user.fullName}</h1>
          <p>Quản lý hồ sơ, địa chỉ giao hàng và thông tin liên quan tới luồng User Service.</p>
        </div>
        <button type="button" onClick={() => onNavigate("/profile/edit")}>
          <Pencil size={17} />
          Chỉnh sửa
        </button>
      </section>

      <section className="account-grid">
        <article className="account-panel">
          <div className="panel-title-row">
            <UserRound size={20} />
            <h2>Thông tin cá nhân</h2>
          </div>
          <dl className="info-list">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{user.phone || "Chưa cập nhật"}</dd>
            </div>
            <div>
              <dt>Ngày sinh</dt>
              <dd>{user.birthday || "Chưa cập nhật"}</dd>
            </div>
            <div>
              <dt>Giới tính</dt>
              <dd>{user.gender || "Chưa cập nhật"}</dd>
            </div>
            <div>
              <dt>Vai trò</dt>
              <dd>{user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</dd>
            </div>
          </dl>
        </article>

        <article className="account-panel">
          <div className="panel-title-row">
            <BadgeCheck size={20} />
            <h2>Trạng thái thành viên</h2>
          </div>
          <div className="metric-list">
            <div>
              <CalendarDays size={20} />
              <span>Tham gia từ</span>
              <strong>{user.memberSince}</strong>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>Điểm tích lũy</span>
              <strong>{user.loyaltyPoint.toLocaleString("vi-VN")}</strong>
            </div>
            <div>
              <Phone size={20} />
              <span>Thông báo marketing</span>
              <strong>{user.marketingOptIn ? "Đang bật" : "Đang tắt"}</strong>
            </div>
          </div>
        </article>
      </section>

      <article className="account-panel">
        <div className="panel-title-row">
          <MapPin size={20} />
          <h2>Địa chỉ mặc định</h2>
        </div>
        {defaultAddress ? (
          <div className="default-address">
            <strong>{defaultAddress.label}</strong>
            <p>
              {defaultAddress.receiverName} - {defaultAddress.phone}
            </p>
            <span>
              {defaultAddress.line1}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
            </span>
          </div>
        ) : (
          <div className="empty-state">
            <Home size={28} />
            <p>Bạn chưa có địa chỉ giao hàng.</p>
          </div>
        )}
        <div className="action-row">
          <button type="button" onClick={() => onNavigate("/profile/addresses")}>
            Quản lý địa chỉ
          </button>
        </div>
      </article>
    </AccountLayout>
  );
}

type EditProfilePageProps = {
  route: RouteId;
  user: UserProfile;
  onNavigate: Navigate;
  onSaveProfile: (profile: UserProfile) => void | Promise<void>;
};

export function EditProfilePage({ route, user, onNavigate, onSaveProfile }: EditProfilePageProps) {
  const [form, setForm] = useState(user);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof UserProfile>(field: K, value: UserProfile[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.fullName.trim() || !form.username.trim()) {
      setNotice("Họ tên và username không được để trống.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      await onSaveProfile({
        ...form,
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        phone: form.phone.trim()
      });
      onNavigate("/profile");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AccountLayout route={route} user={user} onNavigate={onNavigate}>
      <section className="account-panel">
        <div className="panel-title-row">
          <Pencil size={20} />
          <div>
            <h1>Chỉnh sửa hồ sơ</h1>
            <p>Form này sau này sẽ gọi `PUT /api/users/me` qua API Gateway.</p>
          </div>
        </div>

        {notice ? <div className="notice">{notice}</div> : null}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="two-column-fields">
            <label className="field">
              <span>Họ tên</span>
              <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
            </label>
            <label className="field">
              <span>Username</span>
              <input disabled value={form.username} />
            </label>
          </div>

          <div className="two-column-fields">
            <label className="field">
              <span>Email</span>
              <input disabled value={form.email} />
            </label>
            <label className="field">
              <span>Số điện thoại</span>
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
          </div>

          <div className="two-column-fields">
            <label className="field">
              <span>Ngày sinh</span>
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => updateField("birthday", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Giới tính</span>
              <select value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
                <option value="">Chưa chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>
          </div>

          <label className="check-row">
            <input
              checked={form.marketingOptIn}
              onChange={(event) => updateField("marketingOptIn", event.target.checked)}
              type="checkbox"
            />
            Nhận thông báo ưu đãi và trạng thái đơn hàng.
          </label>

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => onNavigate("/profile")}>
              Hủy
            </button>
            <button className="submit-button compact" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Đang lưu" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </AccountLayout>
  );
}

type AddressesPageProps = {
  route: RouteId;
  user: UserProfile;
  onNavigate: Navigate;
  onAddAddress: (address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => Promise<Address[]>;
  onSetDefaultAddress: (addressId: string) => Promise<Address[]>;
  onRemoveAddress: (addressId: string) => Promise<Address[]>;
};

const emptyAddress = {
  label: "",
  receiverName: "",
  phone: "",
  line1: "",
  ward: "",
  district: "",
  city: ""
};

export function AddressesPage({
  route,
  user,
  onNavigate,
  onAddAddress,
  onSetDefaultAddress,
  onRemoveAddress
}: AddressesPageProps) {
  const [addresses, setAddresses] = useState(user.addresses);
  const [draft, setDraft] = useState(emptyAddress);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function setDefault(addressId: string) {
    try {
      const next = await onSetDefaultAddress(addressId);
      setAddresses(next);
      setNotice("Đã cập nhật địa chỉ mặc định.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể cập nhật địa chỉ mặc định.");
    }
  }

  async function removeAddress(addressId: string) {
    try {
      const next = await onRemoveAddress(addressId);
      setAddresses(next);
      setNotice("Đã xóa địa chỉ giao hàng.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể xóa địa chỉ.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.label.trim() || !draft.receiverName.trim() || !draft.phone.trim() || !draft.line1.trim()) {
      setNotice("Vui lòng nhập tên địa chỉ, người nhận, số điện thoại và địa chỉ cụ thể.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    try {
      const next = await onAddAddress({
        label: draft.label.trim(),
        receiverName: draft.receiverName.trim(),
        phone: draft.phone.trim(),
        line1: draft.line1.trim(),
        ward: draft.ward.trim(),
        district: draft.district.trim(),
        city: draft.city.trim() || "TP. Hồ Chí Minh",
        isDefault: addresses.length === 0
      });
      setAddresses(next);
      setDraft(emptyAddress);
      setNotice("Đã thêm địa chỉ giao hàng.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể thêm địa chỉ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AccountLayout route={route} user={user} onNavigate={onNavigate}>
      <section className="account-panel">
        <div className="panel-title-row">
          <MapPin size={20} />
          <div>
            <h1>Địa chỉ giao hàng</h1>
            <p>Địa chỉ thuộc User Service và sẽ được Order Service dùng khi tạo đơn hàng.</p>
          </div>
        </div>

        {notice ? <div className="notice success">{notice}</div> : null}

        <div className="address-grid">
          {addresses.map((address) => (
            <article className="address-card" key={address.id}>
              <div>
                <strong>{address.label}</strong>
                {address.isDefault ? <span>Mặc định</span> : null}
              </div>
              <p>
                {address.receiverName} - {address.phone}
              </p>
              <small>
                {address.line1}, {address.ward}, {address.district}, {address.city}
              </small>
              <div className="address-actions">
                <button type="button" onClick={() => setDefault(address.id)}>
                  Đặt mặc định
                </button>
                <button type="button" onClick={() => removeAddress(address.id)}>
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>

        <form className="profile-form address-form" onSubmit={handleSubmit}>
          <h2>Thêm địa chỉ mới</h2>
          <div className="two-column-fields">
            <label className="field">
              <span>Tên địa chỉ</span>
              <input
                value={draft.label}
                onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
                placeholder="Nhà riêng, công ty..."
              />
            </label>
            <label className="field">
              <span>Người nhận</span>
              <input
                value={draft.receiverName}
                onChange={(event) => setDraft((current) => ({ ...current, receiverName: event.target.value }))}
              />
            </label>
          </div>
          <div className="two-column-fields">
            <label className="field">
              <span>Số điện thoại</span>
              <input
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Thành phố</span>
              <input
                value={draft.city}
                onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
          </div>
          <div className="two-column-fields">
            <label className="field">
              <span>Phường/Xã</span>
              <input
                value={draft.ward}
                onChange={(event) => setDraft((current) => ({ ...current, ward: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Quận/Huyện</span>
              <input
                value={draft.district}
                onChange={(event) => setDraft((current) => ({ ...current, district: event.target.value }))}
              />
            </label>
          </div>
          <label className="field">
            <span>Địa chỉ cụ thể</span>
            <input
              value={draft.line1}
              onChange={(event) => setDraft((current) => ({ ...current, line1: event.target.value }))}
            />
          </label>
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => onNavigate("/profile")}>
              Về hồ sơ
            </button>
            <button className="submit-button compact" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Đang thêm" : "Thêm địa chỉ"}
            </button>
          </div>
        </form>
      </section>
    </AccountLayout>
  );
}
