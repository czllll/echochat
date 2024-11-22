'use client'
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const router = useRouter()

    router.push('/explore');
    return (
        <div>
            <h1>Loading...</h1>
        </div>
    )
}

export default DashboardPage;