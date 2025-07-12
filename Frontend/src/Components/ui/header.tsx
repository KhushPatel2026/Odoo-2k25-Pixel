import Logo from "/src/assets/StepIn Transparent Logo.png";

function Header() {
  return (
    <header>
      <img src={Logo} alt="StepIn Logo" className="h-10 w-auto" />
    </header>
  );
}

export default Header;