import { SettingsTabs } from '@/components/ui/SettingsTabs'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold dark:text-slate-100">Configuración</h1>
      </div>
      <SettingsTabs />
      {children}
    </div>
  )
}
