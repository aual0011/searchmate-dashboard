import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Database, ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage your application's data
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <Link to="/admin/add-person">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Person
            </Link>
          </Button>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <motion.div variants={item}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <h3 className="text-3xl font-bold">{totalRecords}</h3>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <SearchIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                    <h3 className="text-3xl font-bold">{stats?.totalSearches || 0}</h3>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Search Queries</p>
                    <h3 className="text-3xl font-bold">{recentSearches.length}</h3>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Recent Search Queries</h2>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-4">
                  {recentSearches.map((search: any) => (
                    <div 
                      key={search.id} 
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{search.query}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(search.created_at).toLocaleDateString()} - {search.type} search
                          </p>
                        </div>
                        <SearchIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No search queries yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;