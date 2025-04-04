"use client"
import Link from "next/link";
import Image from "next/image";
export default function Header(){
return(
    <header className="bg-white w-full h-[60px] content-center ">
        <div className="flex flex-row justify-around "> 
            <Link className="text-[#AA6227] text-2xl w-[30%]" href="null ">
            trai Hotels
            </Link>
            <div className="flex w-[35%] content-evenly gap-[20px] flex-row items-center justify-between">
                <Link  className="text-[#898989] hover:text-[#2E4C59] hover:underline" href="null ">
                Home
                </Link>
                <Link  className="text-[#898989] hover:text-[#2E4C59] hover:underline" href="null ">
                Hotels for sale
                </Link>
                <Link  className="text-[#898989] hover:text-[#2E4C59] hover:underline" href="null ">
                News
                </Link>
                <Link  className="text-[#898989] hover:text-[#2E4C59] hover:underline" href="null ">
                Contacts
                </Link>
                </div>
                <div className="bg-[#2E4C59] rounded-[5px] w-[160px] content-center justify-around flex h-[35px] ">
                    <Link className="p-1 text-white hover:underline flex content-center justify-around w-[200px] items-center flex-row-reverse"  href="null" >
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