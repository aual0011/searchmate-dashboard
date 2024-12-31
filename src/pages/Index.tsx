import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Person Search</h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name, address, phone, email, or NID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={searching}>
              Search
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageSearch}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {searchResults.map((result) => (
            <Card key={result.id} className="p-6">
              <div className="flex gap-6">
                {result.photo_url && (
                  <img
                    src={result.photo_url}
                    alt={result.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{result.name}</h2>
                  {result.address && (
                    <p className="text-gray-600">Address: {result.address}</p>
                  )}
                  {result.phone_number && (
                    <p className="text-gray-600">Phone: {result.phone_number}</p>
                  )}
                  {result.email && (
                    <p className="text-gray-600">Email: {result.email}</p>
                  )}
                  {result.social_media && (
                    <p className="text-gray-600">
                      Social Media: {result.social_media}
                    </p>
                  )}
                  {result.nid_number && (
                    <p className="text-gray-600">NID: {result.nid_number}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {searchResults.length === 0 && searchTerm && !searching && (
            <p className="text-center text-gray-500">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;