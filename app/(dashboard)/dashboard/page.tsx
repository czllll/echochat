'use client'
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const router = useRouter()

    router.push('/explore');
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    )
}

export default DashboardPage;