"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, TrendingUp, Store, Users, MessageSquare, Clock } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AdminReportsProps {
  totalUsers: number
  totalMerchants: number
  totalComments: number
  verifiedMerchants: number
  pendingComments: number
  unverifiedMerchants: number
}

export function AdminReports({
  totalUsers,
  totalMerchants,
  totalComments,
  verifiedMerchants,
  pendingComments,
  unverifiedMerchants,
}: AdminReportsProps) {
  const data = [
    {
      name: "Usuarios",
      total: totalUsers,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Comercios",
      total: totalMerchants,
      fill: "hsl(var(--chart-2))",
    },
    {
      name: "Comentarios",
      total: totalComments,
      fill: "hsl(var(--chart-3))",
    },
  ]

  const handleExportCSV = () => {
    const csvContent = `Métrica,Valor
Usuarios Totales,${totalUsers}
Comercios Totales,${totalMerchants}
Comercios Verificados,${verifiedMerchants}
Comercios Sin Verificar,${unverifiedMerchants}
Comentarios Aprobados,${totalComments}
Comentarios Pendientes,${pendingComments}
`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reporte_plataforma_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportJSON = () => {
    const jsonData = {
      fecha_reporte: new Date().toISOString(),
      metricas: {
        usuarios_totales: totalUsers,
        comercios_totales: totalMerchants,
        comercios_verificados: verifiedMerchants,
        comercios_sin_verificar: unverifiedMerchants,
        comentarios_aprobados: totalComments,
        comentarios_pendientes: pendingComments,
      },
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reporte_plataforma_${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reportes y Estadísticas
              </CardTitle>
              <CardDescription>Exporta reportes de la actividad de la plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={handleExportJSON} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Usuarios Registrados</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Store className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Comercios Activos</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{totalMerchants}</p>
              <p className="text-xs text-green-600 mt-1">
                {verifiedMerchants} verificados • {unverifiedMerchants} pendientes
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Comentarios</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{totalComments}</p>
              <p className="text-xs text-orange-600 mt-1">
                {totalComments} aprobados • {pendingComments} pendientes
              </p>
            </div>
          </div>

          <ChartContainer
            config={{
              total: {
                label: "Total",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Métricas de Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Verificación</span>
                <span className="font-semibold">
                  {totalMerchants > 0 ? Math.round((verifiedMerchants / totalMerchants) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Aprobación de Comentarios</span>
                <span className="font-semibold">
                  {totalComments + pendingComments > 0
                    ? Math.round((totalComments / (totalComments + pendingComments)) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio Comentarios/Comercio</span>
                <span className="font-semibold">
                  {totalMerchants > 0 ? (totalComments / totalMerchants).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Acciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Comentarios por moderar</span>
                </div>
                <span className="font-bold text-orange-700">{pendingComments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Comercios por verificar</span>
                </div>
                <span className="font-bold text-yellow-700">{unverifiedMerchants}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
