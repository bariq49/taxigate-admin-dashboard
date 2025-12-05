"use client";

import RevinueChart from "./components/revinue-chart";
import TopCustomers from "./components/top-customers";
import CustomerStatistics from "./components/customer-statistics";
import Orders from "./components/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSelect from "@/components/dasboard-select";
import EcommerceStats from "./components/ecommerce-stats";

const DashboardPageView = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <EcommerceStats />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <Card>
                        <CardHeader className="border-none pb-0 mb-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <CardTitle className="flex-1 whitespace-nowrap">
                                    Average Revenue
                                </CardTitle>
                                <div className="flex-none">
                                    <DashboardSelect />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <RevinueChart />
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <CustomerStatistics />
                </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <Orders />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <TopCustomers />
                </div>
            </div>
          
        </div>
    );
};

export default DashboardPageView;
