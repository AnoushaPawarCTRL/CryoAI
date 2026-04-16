import { useParams } from "react-router-dom";

export default function IcebergDetails() {
  const { id } = useParams();
  return <h1>Iceberg Details for ID: {id}</h1>;
}
