import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string | null;
  authorOrganization: string | null;
  quote: string;
  avatarUrl: string | null;
}

export interface CustomerLogo {
  id: string;
  organizationName: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

/**
 * Reads verified testimonials/logos for a given product surface
 * ("greentrust" | "labs" | "general"). The `testimonials` and
 * `customer_logos` tables are seeded empty (see
 * database/migrations/009_contact_and_social_proof.sql) and their Row
 * Level Security policy only ever allows reading rows that are both
 * is_published and is_verified, so this function returning an empty
 * array is the correct, honest behavior until real testimonials or
 * customers are added and verified by an admin. Callers must render a
 * neutral empty state, not a placeholder that implies customers
 * exist.
 */
export async function getVerifiedTestimonials(
  relatedProduct: "greentrust" | "labs" | "general"
): Promise<Testimonial[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, author_title, author_organization, quote, avatar_url")
      .eq("related_product", relatedProduct)
      .eq("is_published", true)
      .eq("is_verified", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      authorName: row.author_name,
      authorTitle: row.author_title,
      authorOrganization: row.author_organization,
      quote: row.quote,
      avatarUrl: row.avatar_url,
    }));
  } catch (err) {
    console.error("getVerifiedTestimonials failed, returning empty list", err);
    return [];
  }
}

export async function getVerifiedCustomerLogos(): Promise<CustomerLogo[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customer_logos")
      .select("id, organization_name, logo_url, website_url")
      .eq("is_published", true)
      .eq("is_verified", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      organizationName: row.organization_name,
      logoUrl: row.logo_url,
      websiteUrl: row.website_url,
    }));
  } catch (err) {
    console.error("getVerifiedCustomerLogos failed, returning empty list", err);
    return [];
  }
}
