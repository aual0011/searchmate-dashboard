import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: totalRecords = 0 } = useQuery({
    queryKey: ['totalRecords'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('persons')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: recentSearches = [] } = useQuery({
    queryKey: ['recentSearches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['searchStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return {
        totalSearches: data?.length || 0,
      };
    }
  });

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
                <h3 className="text-2xl font-bold">{totalRecords}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <SearchIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Searches</p>
                <h3 className="text-2xl font-bold">{stats?.totalSearches || 0}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Search Queries</p>
                <h3 className="text-2xl font-bold">{recentSearches.length}</h3>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Search Queries</h2>
          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((search: any) => (
                <div key={search.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {search.query} - {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No search queries yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;