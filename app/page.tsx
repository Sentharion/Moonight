"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "./lib/supabase/client";

import { ensureUserProfile } from "./lib/queries/user";

export default function Home() {
  const router = useRouter();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [register, setRegister] = useState(false);
  const [regisName, setRegisName] = useState("");
  const [regisPass, setRegisPass] = useState("");
  const [regisPassConf, setRegisPassConf] = useState("");
  const [regisError, setRegisError] = useState("");
  const [loading, setLoading] = useState(false);
  const [regisEmail, setRegisEmail] = useState("");

  const [loginEmail, setLoginEmail] = useState("");

  const supabase = createClient();
  const normalizedRegisEmail = regisEmail.trim().toLowerCase();
  const normalizedLoginEmail = loginEmail.trim().toLowerCase();

  const handleSetRegister = async () => {
    setRegister(!register)
    setLoginError("");
    setRegisError("");
    setLoginUser("");
    setLoginPass("");
    setRegisName("");
    setRegisPass("");
    setRegisPassConf("");
  }

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegisError("");

    const normalizedUser = regisName.trim().toLowerCase();
    

    if (!normalizedUser) {
      setRegisError("⚠ Podaj nazwe użytkownika");
      return;
    }

    if (!normalizedRegisEmail) {
      setRegisError("⚠ Podaj adres email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRegisEmail)) {
      setRegisError("⚠ Podaj poprawny adres email");
      return;
    }

    if (normalizedUser.length < 3) {
      setRegisError("⚠ Nazwa użytkownika musi mieć co najmniej 3 znaki");
      return;
    }

    if (!regisPass) {
      setRegisError("⚠ Podaj hasło");
      return;
    }

    if (regisPass.length < 6) {
      setRegisError("⚠ Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    if (regisPass !== regisPassConf) {
      setRegisError("⚠ Hasła się nie zgadzają");
      return;
    }

    setLoading(true);

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: normalizedRegisEmail,
      password: regisPass,
      options: {
        data: {
          username: normalizedUser,
          avatar: null
        }
      }
    });

    if (error) {
      setRegisError(`⚠ Wystąpił błąd rejestracji - ${error.message}`);
      setLoading(false);
      return;
    }

    if (signUpData?.user) {
      await ensureUserProfile(supabase, signUpData.user);
    }

    router.push('/dashboard');
    router.refresh();
  }


  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegisError("");

    const email = loginEmail.trim().toLowerCase();

    if (!email && !loginPass) {
      setLoginError("⚠ Uzupełnij wszystkie pola");
      return;
    }

    if (!email) {
      setLoginError("⚠ Podaj adres email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError("⚠ Podaj poprawny adres email");
      return;
    }

    if (!loginPass) {
      setLoginError("⚠ Podaj hasło");
      return;
    }

    if (loginPass.length < 6) {
      setLoginError("⚠ Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setLoading(true);

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPass,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);

      setLoginError(
        error.message === "Invalid login credentials"
          ? "⚠ Nieprawidłowy email lub hasło"
          : `⚠ ${error.message}`
      );

      setLoading(false);
      return;
    }

    if (loginData?.user) {
      await ensureUserProfile(supabase, loginData.user);
    }

    router.push("/dashboard");
    router.refresh();
  };


  const hasErrors = loginError || regisError

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[#080810] px-6 scanlines">

      <div className="flex w-full max-w-sm flex-col gap-7">

        <div className="flex flex-col items-center gap-2">
          <div className="glitch font-russo text-[38px] tracking-[0.06em] text-neon-pink [text-shadow:0_0_16px_#ff2d78,0_0_48px_#ff2d7860] "> MOONIGHT</div>

          <div className="vhs-badge text-text-light">
            <span className="blink text-text-light uppercase">●</span>{" "}
            Planer Wieczorów Filmowych
          </div>
        </div>

        <div className={`flex flex-col gap-4 rounded-sm p-6 transition-all duration-200 ${loginError || regisError ? "border-2 border-neon-pink shadow-[0_0_24px_#ff2d7840]" : "border border-[#1e1e38]"} bg-[#0e0e1a]`}>
          <div className={`vhs-badge mb-1 text-center ${hasErrors ? "text-neon-pink" : "text-cyan-300"}`} >
            {
              !register ? (
                loginError ? loginError : "▶ Logowanie"
              ) : (
                regisError ? regisError : "▶ Rejestracja"
              )
            }
          </div>
          {!register ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Adres e-mail
                </div>

                <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Adres e-mail" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]"
                />
              </div>

              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Hasło
                </div>
                <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" />
              </div>

              <button type="submit" className="vhs-badge uppercase mt-1 w-full cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7818] py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-all hover:bg-[#ff2d7825] hover:shadow-[0_0_25px_#ff2d7860]">
                ▶ {loading ? "Logowanie..." : "Zaloguj się"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Nazwa użytkownika
                </div>

                <input value={regisName} onChange={(e) => setRegisName(e.target.value)} placeholder="Nazwa użytkownika" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]"
                />
              </div>

              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Adres e-mail
                </div>
                <input type="email" value={regisEmail} onChange={(e) => setRegisEmail(e.target.value)} placeholder="Adres e-mail" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" />
              </div>

              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Hasło
                </div>
                <input type="password" value={regisPass} onChange={(e) => setRegisPass(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" />
              </div>


              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Powtórz hasło
                </div>
                <input type="password" value={regisPassConf} onChange={(e) => setRegisPassConf(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" />
              </div>

              <button type="submit" className="vhs-badge uppercase mt-1 w-full cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7818] py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-all hover:bg-[#ff2d7825] hover:shadow-[0_0_25px_#ff2d7860]">
                ▶ {loading ? "Tworzenie konta..." : "Zarejestruj się"}
              </button>
            </form>
          )}


          {!register ? (<div className="vhs-badge text-center text-text-light mt-1">Nie masz konta? <button onClick={handleSetRegister} className="text-neon-pink hover:text-neon-pink/70 cursor-pointer">Zarejestruj się</button></div>) : (<div className="vhs-badge text-center text-text-light mt-1">Masz konto? <button onClick={handleSetRegister} className="text-neon-pink hover:text-neon-pink/70 cursor-pointer">Zaloguj się</button></div>)}
        </div>

        <div className="vhs-badge uppercase text-center text-[#1e1e38]">
          Stworzone przez Senthariona · v2.6
        </div>

      </div>
    </div>
  );
}
