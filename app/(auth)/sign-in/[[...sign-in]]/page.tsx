"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Jua, Roboto } from "next/font/google";
import axios from "axios";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const titleFont = Jua({
    weight: "400",
    subsets: ["latin"],
});

const textFont = Roboto({
    weight: "700",
    subsets: ["latin"],
});

const buttonFont = Roboto({
    weight: "500",
    subsets: ["latin"],
});


const Page = () => {
    const [step, setStep] = useState(1);
    const [emailAddress, setEmailAddress] = useState("");
    const [inputCode, setInputCode] = useState("");
    const router = useRouter();
    
    const onClick = async () => {
        try {
            await axios.post('/api/customAuth/request-verification', {
                emailAddress
            });
            setStep(2);
        } catch (error) {
            console.log("[REQUEST_VERIFICATION_ERROR]", error);
        } 
    }

    const onClickVerify = async() => {
        try {
            // 查询验证码是否存在
            const { data } = await axios.get(`/api/customAuth/request-verification/?emailAddress=${emailAddress}`);
            const verificationCode = data;
            // 验证和用户输入的是否相同
            if (verificationCode === inputCode) {
                //创建用户或直接跳转
                const response = await axios.post('/api/users', {
                    emailAddress
                });

                if (response.status !== 200) {
                    throw new Error("User creation or validation failed.");
                }
        
                router.push("/dashboard");
            }


        } catch (error) {
            console.log("[VERIFY_CODE_ERROR]", error)
        }
    }


    const handleOauthClick = (provider) => {
        try {
            signIn(provider, { callbackUrl: '/dashboard' })
        } catch (error) {
            router.push("/sign-in");
            toast.error("Something went wrong")
            console.log(error)
        }
    }

    return (
        <>
            {
            step===1 && (
                <>
                    <div className="flex flex-col">
                    <div className="relative w-full h-[180px]">
                        <Image alt="Background" fill src="/background.png" className="object-cover"/>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
        
                    </div>
        
                    <div className="flex flex-col  items-center py-4 space-y-4 min-h-screen">
        
                    <div className="w-[80vw] max-w-[400px] pt-8 space-y-4">
                        <div className="flex flex-row space-x-2 justify-center">
                            <div className="relative w-8 h-8 ">
                                <Image alt="Logo" fill src="/logo.png" />
                            </div>
                            <h1 className={`flex text-4xl leading-none items-center justify-center ${titleFont.className}`}>
                                EchoChat
                            </h1>
                        </div>
                        <div className={`text-xl text-center ${textFont.className}`}>
                            Talk to ChatGPT, GPT-4o, Claude 3 Opus, DALLE 3, and millions of others - all on EchoChat.
                        </div>
                        <div className="flex flex-col pt-6 space-y-6">
                            <Button className={`bg-white  text-black rounded-3xl hover:bg-black/10 border p-4 h-11 ${buttonFont.className}`}
                                onClick={() => handleOauthClick("google")}>
                                <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} />
                                Continue with Google
                            </Button>
                            <Button className={`bg-white  text-black rounded-3xl hover:bg-black/10 border p-4 h-11 ${buttonFont.className}`}
                                onClick={() => handleOauthClick("github")}>
                                <Image src="/icons/github.svg" alt="Github Logo" width={20} height={20} />
                                Continue with Github
                            </Button>
                        </div>
                        <div className="flex items-center space-x-4 p-2">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="text-gray-500">or</span>
                            <div className="flex-grow border-t border-gray-300"></div>
        
                        </div>
                        <div className="pb-6">
                            <Input placeholder="Email address" className="h-11"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}/>
                        </div>
                        <Button onClick={onClick} className={`bg-violet-400  text-white hover:bg-violet-600 rounded-3xl border p-4 w-full h-11 ${buttonFont.className}`}>
                            Go
                        </Button>
        
                    
                        </div>
        
                    </div>
                
        
                    </div>
                </>
            )
            }
            {
                step===2 && (
                    <>
                        <div className="flex flex-col  w-full min-h-screen items-center justify-center">
                            <div className="w-[80vw] md:max-w-[400px] space-y-2">
                                <div className="flex flex-row space-x-2 justify-start">
                                    <div className="relative w-8 h-8 ">
                                        <Image alt="Logo" fill src="/logo.png" />
                                    </div>
                                    <h1 className={`flex text-4xl leading-none items-center justify-center ${titleFont.className}`}>
                                        EchoChat
                                    </h1>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Get Started
                                </p>
                                <h1 className={`text-2xl ${textFont.className}`}>
                                    Verify Email
                                </h1>
                                <p className="text-muted-foreground text-sm pb-4">
                                    Your code was send to {emailAddress}
                                </p>
                                <Input placeholder="Code" className="h-11" 
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}/>
                                <Button className={`bg-transparent  text-black text-md hover:bg-black/5 rounded-3xl shadow-none p-4 w-full h-11 ${buttonFont.className}`}>
                                Resend Code
                                </Button>
                                <Button onClick={onClickVerify} className={`bg-violet-400  text-white text-md hover:bg-violet-600 rounded-3xl border p-4 w-full h-11 ${buttonFont.className}`}>
                                Verify
                                </Button>
                                <Button className={`bg-transparent text-black text-md hover:bg-black/5 rounded-3xl shadow-none p-4 w-full h-11 ${buttonFont.className}`}>
                                Use a different email
                                </Button>
                            </div>


                        </div>
                    </>
                )
            }
        </>


    )
}

export default Page;