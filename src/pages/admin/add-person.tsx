import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddPersonForm {
  name: string;
  address: string;
  phone_number: string;
  email: string;
  social_media: string;
  nid_number: string;
}

const AddPerson = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPersonForm>();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('person_photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('person_photos')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error uploading photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AddPersonForm) => {
    try {
      const { error } = await supabase.from('persons').insert({
        ...data,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Person added successfully",
      });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding person",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Person</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register("phone_number")}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="social_media">Social Media</Label>
            <Input
              id="social_media"
              {...register("social_media")}
            />
          </div>

          <div>
            <Label htmlFor="nid_number">NID Number</Label>
            <Input
              id="nid_number"
              {...register("nid_number")}
            />
          </div>

          <div>
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Person
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddPerson;