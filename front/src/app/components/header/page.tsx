"use client"
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Content } from "next/font/google";

export default function Header(){
    const pathname = usePathname();
    console.log("", pathname)
return(
    
    <header className="bg-white w-full h-[68px] content-center ">
        <div className="flex flex-row justify-around items-center"> 
            <Link className="text-[#AA6227] text-[45px] w-[30%]" href="null ">
            trai Hotels
            </Link>
            <div className="flex w-[35%] content-evenly gap-[20px] flex-row items-center justify-between">
                <Link  className="flex flex-col content-center items-center  text-[#898989] hover:text-[#2E4C59]" href="Home">
                Home
                {pathname === "/Home" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline after" href="Hotels_for_saleome">
                Hotels for sale
                {pathname === "/Hotels_for_saleome" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link  className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline" href="News">
                News
                {pathname === "/News" ?(
                <div  className=" relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                <Link  className="flex flex-col items-center text-[#898989] hover:text-[#2E4C59] hover:underline" href="Contacts">
                Contacts
                {pathname === "/Contacts" ?(
                <div  className="relative w-[150px] h-[1px] bg-black hover:bg-[#2E4C59]">
                </div>
                ):(<div></div>)}
                </Link>
                </div>
                <div className="bg-[#2E4C59] rounded-[5px] w-[160px] content-center justify-around flex h-[35px] ">
                    <Link className="p-1 text-white hover:underline flex content-center justify-around w-[200px] items-center flex-row-reverse "  href="/registr" >
                        <Image 
                            src="/image/login.png"                   
                            alt="Логотип"
                            width={20}
                            height={20}
                        />
                    Авторизация 
                    </Link>
            </div>
        </div>
    </header>
)
}