import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon, Database, ArrowUpRight, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Monitor and manage your application's data efficiently
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link to="/admin/add-person" className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Person
            </Link>
          </Button>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={item}>
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg dark:bg-gray-800/80 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                      <h3 className="text-3xl font-bold">{totalRecords}</h3>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg dark:bg-gray-800/80 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl">
                      <SearchIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                      <h3 className="text-3xl font-bold">{stats?.totalSearches || 0}</h3>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg dark:bg-gray-800/80 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl">
                      <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Search Queries</p>
                      <h3 className="text-3xl font-bold">{recentSearches.length}</h3>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={item} 
          initial="hidden" 
          animate="show"
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-lg dark:bg-gray-800/80 border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Recent Search Queries</h2>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-4">
                  {recentSearches.map((search: any) => (
                    <motion.div 
                      key={search.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50",
                        "hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600/50 dark:hover:to-gray-700/50",
                        "group cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {search.query}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(search.created_at).toLocaleDateString()} - {search.type} search
                          </p>
                        </div>
                        <SearchIcon className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No search queries yet</p>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;