export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          business_amount: number
          business_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_time: string | null
          id: string
          location_id: string
          number_of_guests: number | null
          payment_reference: string | null
          payment_status: string | null
          platform_fee: number | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          business_amount: number
          business_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          location_id: string
          number_of_guests?: number | null
          payment_reference?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          business_amount?: number
          business_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          location_id?: string
          number_of_guests?: number | null
          payment_reference?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_accounts: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          bank_verified: boolean | null
          business_email: string
          business_name: string
          business_type: string | null
          created_at: string | null
          documents_submitted: boolean | null
          id: string
          owner_full_name: string | null
          phone_number: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          wallet_balance: number | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          business_email: string
          business_name: string
          business_type?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          id?: string
          owner_full_name?: string | null
          phone_number?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          wallet_balance?: number | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          business_email?: string
          business_name?: string
          business_type?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          id?: string
          owner_full_name?: string | null
          phone_number?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_analytics: {
        Row: {
          business_id: string
          clicks_to_maps: number | null
          created_at: string | null
          date: string
          favorites: number | null
          id: string
          location_id: string
          planned_visits: number | null
          views: number | null
        }
        Insert: {
          business_id: string
          clicks_to_maps?: number | null
          created_at?: string | null
          date: string
          favorites?: number | null
          id?: string
          location_id: string
          planned_visits?: number | null
          views?: number | null
        }
        Update: {
          business_id?: string
          clicks_to_maps?: number | null
          created_at?: string | null
          date?: string
          favorites?: number | null
          id?: string
          location_id?: string
          planned_visits?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_analytics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_analytics_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_locations: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          is_owner: boolean | null
          location_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          is_owner?: boolean | null
          location_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          is_owner?: boolean | null
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_urls: string[] | null
          likes_count: number | null
          location_id: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number | null
          location_id?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes_count?: number | null
          location_id?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          location_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_listings: {
        Row: {
          amount_paid: number | null
          business_id: string
          clicks: number | null
          created_at: string | null
          end_date: string
          id: string
          impressions: number | null
          location_id: string
          payment_status: string | null
          start_date: string
          tier: string | null
        }
        Insert: {
          amount_paid?: number | null
          business_id: string
          clicks?: number | null
          created_at?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          location_id: string
          payment_status?: string | null
          start_date: string
          tier?: string | null
        }
        Update: {
          amount_paid?: number | null
          business_id?: string
          clicks?: number | null
          created_at?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          location_id?: string
          payment_status?: string | null
          start_date?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_claims: {
        Row: {
          business_id: string
          business_name: string
          cac_document_url: string | null
          created_at: string | null
          id: string
          location_id: string
          owner_full_name: string
          phone_number: string
          phone_verified: boolean | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          signboard_photo_url: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string | null
          utility_bill_url: string | null
        }
        Insert: {
          business_id: string
          business_name: string
          cac_document_url?: string | null
          created_at?: string | null
          id?: string
          location_id: string
          owner_full_name: string
          phone_number: string
          phone_verified?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          signboard_photo_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          utility_bill_url?: string | null
        }
        Update: {
          business_id?: string
          business_name?: string
          cac_document_url?: string | null
          created_at?: string | null
          id?: string
          location_id?: string
          owner_full_name?: string
          phone_number?: string
          phone_verified?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          signboard_photo_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          utility_bill_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_claims_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          amenities: string[] | null
          area: string
          best_time: string | null
          budget_level: string
          category: string
          created_at: string
          description: string | null
          estimated_budget_max: number | null
          estimated_budget_min: number | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_claimed: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_business_id: string | null
          rating: number | null
          state: string
          total_reviews: number | null
        }
        Insert: {
          amenities?: string[] | null
          area: string
          best_time?: string | null
          budget_level: string
          category: string
          created_at?: string
          description?: string | null
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_business_id?: string | null
          rating?: number | null
          state?: string
          total_reviews?: number | null
        }
        Update: {
          amenities?: string[] | null
          area?: string
          best_time?: string | null
          budget_level?: string
          category?: string
          created_at?: string
          description?: string | null
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_business_id?: string | null
          rating?: number | null
          state?: string
          total_reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_owner_business_id_fkey"
            columns: ["owner_business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          event_id: string | null
          id: string
          is_read: boolean | null
          location_id: string | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          location_id?: string | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          location_id?: string | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "planned_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      new_location_submissions: {
        Row: {
          address: string | null
          amenities: string[] | null
          approved_location_id: string | null
          area: string
          best_time: string | null
          budget_level: string
          business_id: string
          category: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          estimated_budget_max: number | null
          estimated_budget_min: number | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: string
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          approved_location_id?: string | null
          area: string
          best_time?: string | null
          budget_level: string
          business_id: string
          category: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          approved_location_id?: string | null
          area?: string
          best_time?: string | null
          budget_level?: string
          business_id?: string
          category?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "new_location_submissions_approved_location_id_fkey"
            columns: ["approved_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_location_submissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          business_amount: number | null
          business_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          paystack_reference: string | null
          platform_commission: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          business_amount?: number | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          platform_commission?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          business_amount?: number | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          platform_commission?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          business_id: string
          created_at: string | null
          failure_reason: string | null
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["payout_status"] | null
          transfer_code: string | null
          transfer_reference: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          business_id: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"] | null
          transfer_code?: string | null
          transfer_reference?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_name?: string
          business_id?: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"] | null
          transfer_code?: string | null
          transfer_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_events: {
        Row: {
          budget_breakdown: Json | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location_id: string | null
          notes: string | null
          schedule: Json | null
          state: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_breakdown?: Json | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          schedule?: Json | null
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_breakdown?: Json | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          schedule?: Json | null
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          budget_preference: string | null
          created_at: string
          favorite_activities: string[] | null
          full_name: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          phone_number: string | null
          phone_verification_code: string | null
          phone_verification_expires_at: string | null
          phone_verified: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          budget_preference?: string | null
          created_at?: string
          favorite_activities?: string[] | null
          full_name?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_expires_at?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          budget_preference?: string | null
          created_at?: string
          favorite_activities?: string[] | null
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_expires_at?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          location_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          business_response: string | null
          comment: string | null
          created_at: string | null
          id: string
          is_verified_booking: boolean | null
          location_id: string
          rating: number
          responded_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          business_response?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_booking?: boolean | null
          location_id: string
          rating: number
          responded_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          business_response?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified_booking?: boolean | null
          location_id?: string
          rating?: number
          responded_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "business"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "refunded"
      payout_status: "pending" | "processing" | "completed" | "failed"
      verification_status: "pending" | "under_review" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "business"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ],
      payout_status: ["pending", "processing", "completed", "failed"],
      verification_status: ["pending", "under_review", "approved", "rejected"],
    },
  },
} as const
