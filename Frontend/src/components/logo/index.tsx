import { Link } from "react-router-dom"
import logoSvg from "../../assets/TalkioLogo.svg"
import { cn } from "../../lib/utils"

interface LogoProps {
    url?: string
    showText?: boolean
    imgClass?: string
    textClass?: string
}

const Logo = ({
    url = "/",
    showText = true,
    imgClass = "size-[50px]",
    textClass
}: LogoProps) => {
    return (
        <Link to={url} className="flex items-center gap-2 w-fit">
            <img src={logoSvg} alt="Talkio Logo" className={cn(imgClass)} />

            {showText &&
                (<span className={cn("font-semibold text-lg leading-tight", textClass)}>
                    Talkio
                </span>)
            }
        </Link>
    )
}

export default Logo