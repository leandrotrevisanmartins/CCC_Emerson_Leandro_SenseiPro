import { useEffect, useState } from "react";
import { utilsService } from "../services";
const HealthCheck = () => {
  const [status, setStatus] = useState<"online"|"offline"|"verificando">("verificando");
  useEffect(() => {
    utilsService.healthCheck().then(() => setStatus("online")).catch(() => setStatus("offline"));
  }, []);
  return (
    <span style={{ fontSize: "0.8rem", color: "#adb5bd" }}>
      <span className={status === "online" ? "statusUp" : "statusDown"} />
      API {status === "verificando" ? "verificando..." : status}
    </span>
  );
};
export default HealthCheck;
