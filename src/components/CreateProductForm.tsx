
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { addProduct } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  category: z.string({required_error: "Please select a category."}),
  unitPrice: z.coerce.number().positive("Price must be a positive number."),
  minBulkQuantity: z.coerce.number().int().positive("Quantity must be a positive whole number."),
  timeLimit: z.date({required_error: "A closing date is required."}),
  location: z.string().optional(),
});

export function CreateProductForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: undefined,
      unitPrice: 0,
      minBulkQuantity: 0,
      timeLimit: undefined,
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to create a product.", variant: "destructive" });
        return;
    }
    try {
      const newProductData = {
          ...values,
          supplierName: user.name, // Use logged in user's name
      }
      const newProduct = await addProduct(newProductData);
      toast({
        title: "Success!",
        description: "Your product listing has been created.",
      });
      router.push(`/products/${newProduct.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Potatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Vegetable">Vegetable</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Pantry">Pantry</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($ per kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="minBulkQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Bulk Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Order Closing Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery/Pickup Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Warehouse A, Springfield" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
