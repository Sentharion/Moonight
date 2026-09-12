"use client"
import {useState} from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [register, setRegister] = useState(false);
  const [regisName, setRegisName] = useState("");
  const [regisPass, setRegisPass] = useState("");
  const [regisPassConf, setRegisPassConf] = useState("");
  const [regisError, setRegisError] = useState(false);
  const [regisPassError, setRegisPassError] = useState(false);

  const handleSetRegister = () => {
    setRegister(!register);
    setLoginError(false);
    setRegisError(false);
    setRegisPassError(false);
  }
  const handleLogin = () => {
    if(loginUser.trim() === "" || loginPass.trim() === ""){
      setLoginError(true);
      return;
    }
    router.push("/dashboard");
  }

  const handleRegister = () => {
    if(regisName.trim() === "" || regisPass.trim() === "" || regisPassConf.trim() === ""){
      setRegisError(true);
      setRegisPassError(false);
      return;
    }

    if(regisPass !== regisPassConf){
      setRegisPassError(true);
      setRegisError(false);
      return;
    }
    
    router.push("/dashboard");
  }
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

        <div className={`flex flex-col gap-4 rounded-sm p-6 transition-all duration-200 ${loginError || regisError || regisPassError ? "border-2 border-neon-pink shadow-[0_0_24px_#ff2d7840]" : "border border-[#1e1e38]"} bg-[#0e0e1a]`}>
          <div className={`vhs-badge mb-1 text-center ${loginError || regisError || regisPassError ? "text-neon-pink" : "text-cyan-300"}`} >
            {!register ? (loginError ? "⚠ Uzupełnij wszystkie pola!" : "▶ Logowanie") : (regisPassError ? "⚠ Hasła nie są takie same!" : (regisError ? "⚠ Uzupełnij wszystkie pola!" : "▶ Rejestracja"))}
          </div>
          {!register ? (
            <>
              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Nazwa użytkownika
                </div>

                <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="Nazwa użytkownika" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]"
                onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
                }}
                />
              </div>

              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Hasło
                </div>
                <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" onKeyDown={(e) => {if (e.key === "Enter") handleLogin();}}/>
              </div>

              <button onClick={handleLogin} className="vhs-badge uppercase mt-1 w-full cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7818] py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-all hover:bg-[#ff2d7825] hover:shadow-[0_0_25px_#ff2d7860]">
                ▶ Zaloguj się
              </button>
            </>
          ) : (
            <>
              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Nazwa użytkownika
                </div>

                <input value={regisName} onChange={(e) => setRegisName(e.target.value)} placeholder="Nazwa użytkownika" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Barlow'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]"
                onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
                }}
                />
              </div>

              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Hasło
                </div>
                <input type="password" value={regisPass} onChange={(e) => setRegisPass(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" onKeyDown={(e) => {if (e.key === "Enter") handleLogin();}}/>
              </div>

              
              <div>
                <div className="vhs-badge mb-2 uppercase text-text-light">
                  Powtórz hasło
                </div>
                <input type="password" value={regisPassConf} onChange={(e) => setRegisPassConf(e.target.value)} placeholder="••••••••" className="w-full rounded-sm border border-[#1e1e38] bg-[#080810] px-3 py-3 font-['Share_Tech_Mono'] text-[14px] text-[#e8e0ff] outline-none caret-neon-pink transition-all placeholder:text-[#333360] focus:border-[#ff2d7880]" onKeyDown={(e) => {if (e.key === "Enter") handleLogin();}}/>
              </div>

              <button onClick={handleRegister} className="vhs-badge uppercase mt-1 w-full cursor-pointer rounded-sm border-2 border-neon-pink bg-[#ff2d7818] py-4 font-['Russo_One'] text-[15px] tracking-[0.08em] text-neon-pink shadow-[0_0_20px_#ff2d7840] transition-all hover:bg-[#ff2d7825] hover:shadow-[0_0_25px_#ff2d7860]">
                ▶ Zarejestruj się
              </button>
            </>
          )}
          

          {!register ? (<div className="vhs-badge text-center text-text-light mt-1">Nie masz konta? <button onClick={handleSetRegister} className="text-neon-pink hover:text-neon-pink/70 cursor-pointer">Zarejestruj się</button></div>) : ( <div className="vhs-badge text-center text-text-light mt-1">Masz konto? <button onClick={handleSetRegister} className="text-neon-pink hover:text-neon-pink/70 cursor-pointer">Zaloguj się</button></div>)}
        </div>

      <div className="vhs-badge uppercase text-center text-[#1e1e38]">
        Stworzone przez Senthariona · v2.6
      </div>

      </div>
    </div>
  );
}
