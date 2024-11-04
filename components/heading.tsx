interface HeadingProps {
    title: string;
}


const Heading = ({title}: HeadingProps) => {
    return (
        <div className="flex items-center justify-center bg-gray-100 h-[60px] text-xl font-bold text-gray-700 border-b">
            {title}
        </div>
    )
}
export default Heading;