import { Users, Building2, Award, Medal } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: <Users className="h-10 w-10 text-yellow-400" />,
      value: "11",
      label: "Peserta Aktif",
    },
    {
      icon: <Building2 className="h-10 w-10 text-green-400" />,
      value: "11",
      label: "Divisi Tersedia",
    },
    {
      icon: <Medal className="h-10 w-10 text-blue-400" />,
      value: "98%",
      label: "Tingkat Kelulusan",
    },
    {
      icon: <Award className="h-10 w-10 text-purple-400" />,
      value: "5",
      label: "Tahun Pengalaman",
    },
  ];

  return (
    <section className="bg-gray-100 py-20 text-gray-800 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-1">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center rounded-2xl bg-white backdrop-blur-md shadow-lg border border-gray-400/20 p-6"
          >
            <div className="mb-3">{stat.icon}</div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="mt-1 text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
