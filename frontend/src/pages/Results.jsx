import { useParams } from 'react-router-dom'

export default function Results() {
    const { accountId } = useParams()
    return <div className="p-8">Results for {accountId}</div>
}
