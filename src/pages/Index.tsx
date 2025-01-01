import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search, Upload, User, MapPin, Phone, Mail, Globe, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  social_media: string;
  photo_url: string;
  nid_number: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const logSearch = async (query: string) => {
    try {
      await supabase.from('search_logs').insert([
        { query, type: 'text' }
      ]);
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from("persons")
        .select("*")
        .or(
          `name.ilike.%${searchTerm}%,` +
          `address.ilike.%${searchTerm}%,` +
          `phone_number.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `nid_number.ilike.%${searchTerm}%`
        );

      if (error) throw error;

      setSearchResults(data || []);
      await logSearch(searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSearching(true);
      setSearchImage(file);

      // Upload image to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('person_photos')
        .upload(`temp/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('person_photos')
        .getPublicUrl(`temp/${fileName}`);

      // Call the image search edge function
      const response = await fetch('/api/image-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      if (!response.ok) throw new Error('Image search failed');

      const { results } = await response.json();
      setSearchResults(results);

      // Clean up temporary upload
      await supabase.storage
        .from('person_photos')
        .remove([`temp/${fileName}`]);

      await logSearch('Image Search');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Image search failed',
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
          >
            Person Search
          </motion.h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Search for individuals using text or image-based search across our comprehensive database
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-3xl mx-auto mb-12"
        >
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, address, phone, email, or NID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={searching}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Search
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSearch}
                  className="h-12"
                />
                <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {searchResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {result.photo_url ? (
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={result.photo_url}
                        alt={result.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900">{result.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{result.address}</span>
                        </div>
                      )}
                      {result.phone_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{result.phone_number}</span>
                        </div>
                      )}
                      {result.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{result.email}</span>
                        </div>
                      )}
                      {result.social_media && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="h-4 w-4" />
                          <span>{result.social_media}</span>
                        </div>
                      )}
                      {result.nid_number && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="h-4 w-4" />
                          <span>NID: {result.nid_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {searchResults.length === 0 && searchTerm && !searching && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
