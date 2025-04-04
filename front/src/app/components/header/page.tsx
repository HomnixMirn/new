"use client"
import Link from "next/link";
export default function Header(){
return(
    <header className="bg-white ">
        <div>
            <Link className="text-black" href="null ">
            Main 
            </Link>
            <div>
                <Link className="text-black" href="null ">
                Home
                </Link>
                <Link className="text-black" href="null ">
                Hotels for sale
                </Link>
                <Link className="text-black" href="null ">
                News
                </Link>
                <Link className="text-black" href="null ">
                Contacts
                </Link>
            <div>
                <h1>Авторизация</h1>
                </div>
            </div>
        </div>
    </header>
)
}