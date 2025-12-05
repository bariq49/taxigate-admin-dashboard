import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Location, Calender, CalenderCheck } from "@/components/svg";
import { DriverDetails } from "@/lib/types/driver.types";
import { Wallet, Car } from "lucide-react";
import { format } from "date-fns";

interface UserInfoProps {
  driver?: DriverDetails;
}

interface UserInfoItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const UserInfo = ({ driver }: UserInfoProps) => {
  const fullName = driver
    ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || driver.email
    : "N/A";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const userInfo: UserInfoItem[] = driver
    ? [
        {
          icon: User,
          label: "Full Name",
          value: fullName,
        },
        {
          icon: Phone,
          label: "Phone",
          value: driver.phone || "N/A",
        },
        {
          icon: CalenderCheck,
          label: "Joining Date",
          value: formatDate(driver.createdAt),
        },
        {
          icon: Calender,
          label: "Last Updated",
          value: formatDate(driver.updatedAt),
        },
      ]
    : [
        {
          icon: User,
          label: "Full Name",
          value: "Jennyfer Frankin",
        },
        {
          icon: Phone,
          label: "Mobile",
          value: "+(1) 987 6543",
        },
        {
          icon: Location,
          label: "Location",
          value: "101, California",
        },
        {
          icon: CalenderCheck,
          label: "Joining Date",
          value: "24 Nov 2021",
        },
        {
          icon: Calender,
          label: "Last Task Complete ",
          value: "09 Mar 2024",
        },
      ];
  return (
    <Card>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">Information</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {driver ? (
          <p className="text-sm text-default-600">
            Complete driver information and contact details.
          </p>
        ) : (
          <p className="text-sm text-default-600">
            Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..
          </p>
        )}
        <ul className="mt-6 space-y-4">
          {
            userInfo.map((item, index) => (
              <li
                key={`user-info-${index}`}
                className="flex items-center"
              >
                <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
                  <span>{<item.icon className="w-4 h-4 text-primary" />}</span>
                  <span className="text-sm font-medium text-default-800">{item.label}:</span>
                </div>
                <div className="flex-1 text-sm text-default-700">{item.value}</div>
              </li>
            ))
          }
        </ul>
        {driver && (
          <>
            <div className="mt-6 text-lg font-medium text-default-800 mb-4">Driver Statistics</div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <div className="text-sm font-medium text-default-800">
                  Vehicles
                  <span className="font-normal">
                    ({driver.vehicleCount || 0} registered)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <div className="text-sm font-medium text-default-800">
                  Total Earnings
                  <span className="font-normal">
                    ({driver.stats?.totalEarnings || 0} {driver.currency || "EUR"})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <div className="text-sm font-medium text-default-800">
                  Completed Rides
                  <span className="font-normal">
                    ({driver.stats?.completedRides || 0})
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        {!driver && (
          <>
            <div className="mt-6 text-lg font-medium text-default-800 mb-4">Active Teams</div>
            <div className="space-y-3">
              {
                [
                  {
                    title: "UI/UX Designer",
                    img: FigmaImage,
                    total: 65
                  },
                  {
                    title: "Frontend Developer",
                    img: ReactImage,
                    total: 126
                  }
                ].map((item, index) => (
                  <div
                    key={`active-team-${index}`}
                    className="flex items-center gap-2"
                  >
                    <Image src={item.img} alt={item.title} className="w-4 h-4" />
                    <div className="text-sm font-medium text-default-800">
                      {item.title}
                      <span className="font-normal">
                        ({item.total} members)
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfo;