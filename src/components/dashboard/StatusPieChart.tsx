import ReactECharts from 'echarts-for-react'

interface StatusPieChartProps {
  data: { name: string; value: number; color: string }[]
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: '状态分布',
        type: 'pie' as const,
        radius: ['45%', '75%'],
        center: ['50%', '48%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: data.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 280 }}
      notMerge
    />
  )
}
