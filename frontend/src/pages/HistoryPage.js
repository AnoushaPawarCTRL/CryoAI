import { useParams } from "react-router-dom";

export default function HistoryPage() {
  const { id } = useParams();
  return <h1>History Page for Iceberg {id}</h1>;
}
