import { Appbar } from "../components/AppBar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"

const Dashboard = () => {
    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={"10,000"} />
            <Users />
        </div>
    </div>
}

export default Dashboard;