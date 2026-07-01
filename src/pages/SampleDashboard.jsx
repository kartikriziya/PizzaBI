import Content from "../components/SampleContent"

export default function SampleDashboard({ kpi = {}, chart = {} }) {
  return <Content kpi={kpi} chart={chart} />
}
