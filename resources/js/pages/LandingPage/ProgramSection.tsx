import { CheckCircle, Users, LaptopMinimalCheck, ChartLine } from "lucide-react";

export default function ProgramSection() {
  const programs = [
    {
      title: "IT & Teknologi",
      description:
        "Kembangkan kemampuan programming, web development, dan sistem informasi",
      icon: <LaptopMinimalCheck className="h-7 w-7 text-white" />,
      iconColor: "from-blue-400 to-blue-500",
      items: ["Web Development", "Database Management", "System Analysis"],
      quota: "20 orang",
      status: "Tersedia",
      statusColor: "bg-green-600/80",
    },
    {
      title: "Administrasi",
      description:
        "Pelajari sistem administrasi pemerintahan dan manajemen dokumen",
      icon: <ChartLine className="h-7 w-7 text-white" />,
      iconColor: "from-purple-400 to-purple-500",
      items: ["Document Management", "Data Entry", "Office Management"],
      quota: "15 orang",
      status: "Terbatas",
      statusColor: "bg-yellow-600/80",
    },
    {
      title: "Hubungan Masyarakat",
      description:
        "Belajar komunikasi publik, media relations, dan event management",
      icon: <Users className="h-7 w-7 text-white" />,
      iconColor: "from-green-400 to-green-500",
      items: ["Public Relations", "Content Creation", "Event Planning"],
      quota: "10 orang",
      status: "Penuh",
      statusColor: "bg-red-600/80",
    },
  ];

  return (
    <section className="bg-gray-100 py-10 text-gray-800 px-6 border-t border-gray-300"
    >
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold">Program Magang Unggulan</h2>
        <p className="text-gray-500 mt-2">
          Pilih program magang yang sesuai dengan minat dan bakat Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {programs.map((program, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-r ${program.iconColor} flex items-center justify-center mx-auto mb-4`}
            >
              {program.icon}
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-semibold mb-2 text-center">
              {program.title}
            </h3>
            <p className="text-sm text-center text-gray-600 mb-4">
              {program.description}
            </p>

            {/* Items */}
            <ul className="space-y-2 text-sm mb-4">
              {program.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Kuota & Status */}
            <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
              <p>Kuota: {program.quota}</p>
              <span
                className={`text-white text-xs px-3 py-1 rounded-full ${program.statusColor}`}
              >
                {program.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
