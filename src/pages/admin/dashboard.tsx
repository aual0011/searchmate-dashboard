import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Database } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild>
            <Link to="/admin/add-person">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Person
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <SearchIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Searches</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Search Queries</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Search Queries</h2>
          <p className="text-gray-500">No search queries yet</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;