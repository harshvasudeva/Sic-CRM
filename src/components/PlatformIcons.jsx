import { Camera, Video, Music, Globe, Briefcase } from 'lucide-react'

const Instagram = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
)

const Youtube = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2.5 17a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" />
        <path d="M12 17a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" />
        <path d="M21.5 17a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
)

const Linkedin = (props) => <Briefcase {...props} />
const TikTok = (props) => <Music {...props} />
const Twitter = (props) => <Globe {...props} />

const platformIcons = { Instagram, YouTube: Youtube, TikTok, Twitter, 'Twitter/X': Globe, LinkedIn: Linkedin }

export { Instagram, Youtube, Linkedin, TikTok, Twitter, platformIcons }
export default platformIcons
