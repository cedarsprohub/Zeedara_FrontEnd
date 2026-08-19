import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../../../components/shared/Seo";
import Stepper from "./Stepper";
import StepDetails from "./StepDetails";
import StepPermissions from "./StepPermissions";
import StepReview from "./StepReview";
import { ROLES, defaultPermissionState, generatePassword } from "./data";

const HEADERS = {
  1: { title: "Add a user", subtitle: "They receive an email invitation" },
  2: {
    title: "Set permissions",
    subtitle: "Fine-tune what this member can access before you send the invite.",
  },
  3: {
    title: "Invite a team member",
    subtitle: "Confirm the access this invitation grants, then send it.",
  },
};

function findRole(key) {
  return ROLES.find((role) => role.key === key);
}

function InviteUser() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password] = useState(() => generatePassword());
  const [roleKey, setRoleKey] = useState("admin");
  const [permissions, setPermissions] = useState(() =>
    defaultPermissionState(findRole("admin")),
  );
  const [errors, setErrors] = useState({});

  const role = findRole(roleKey);

  const selectRole = (nextKey) => {
    setRoleKey(nextKey);
    setPermissions(defaultPermissionState(findRole(nextKey)));
  };

  const togglePermission = (key) => {
    if (role.locked) return;
    setPermissions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const validateDetails = () => {
    const nextErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!email.trim()) nextErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToPermissions = () => {
    if (validateDetails()) setStep(2);
  };

  // No invite API exists yet — sending just returns to the staff list, the
  // same way the list's own "Add user" button has no live action behind it.
  const sendInvitation = () => navigate("/admin/staff-roles");

  const header = HEADERS[step];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <Seo title="Add a user" description="Invite a new Zeedara admin staff member." noindex />

      <div>
        <h1 className="text-[24px] font-bold text-[#262626]">{header.title}</h1>
        <p className="text-[12px] font-medium text-[#667085]">{header.subtitle}</p>
      </div>

      <Stepper current={step} />

      {step === 1 && (
        <StepDetails
          firstName={firstName}
          lastName={lastName}
          email={email}
          password={password}
          errors={errors}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          roleKey={roleKey}
          onSelectRole={selectRole}
        />
      )}

      {step === 2 && (
        <StepPermissions
          role={role}
          permissions={permissions}
          onTogglePermission={togglePermission}
        />
      )}

      {step === 3 && (
        <StepReview
          firstName={firstName}
          lastName={lastName}
          email={email}
          role={role}
          permissions={permissions}
        />
      )}

      <div className="flex items-center justify-end gap-3 border-t border-[#f0f1f3] pt-5">
        <button
          type="button"
          onClick={step === 1 ? () => navigate("/admin/staff-roles") : () => setStep(step - 1)}
          className="flex h-10 cursor-pointer items-center justify-center border border-[#dadde2] bg-white px-4 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-(--primary-color) hover:text-black"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        <button
          type="button"
          onClick={
            step === 1 ? goToPermissions : step === 2 ? () => setStep(3) : sendInvitation
          }
          className="flex h-10 cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {step === 1
            ? "Proceed to permissions"
            : step === 2
              ? "Proceed to review"
              : "Send invitation"}
        </button>
      </div>
    </div>
  );
}

export default InviteUser;
