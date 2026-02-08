export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            HT_STOCK: {
                Row: {
                    HT_STOCK_ID: string
                    created_at: string
                    HT_PROFILE_ID: string
                    HT_NAME: string
                    HT_TICKER: string | null
                }
                Insert: {
                    HT_STOCK_ID?: string
                    created_at?: string
                    HT_PROFILE_ID: string
                    HT_NAME: string
                    HT_TICKER?: string | null
                }
                Update: {
                    HT_STOCK_ID?: string
                    created_at?: string
                    HT_PROFILE_ID?: string
                    HT_NAME?: string
                    HT_TICKER?: string | null
                }
                Relationships: []
            }
            HT_REPORT: {
                Row: {
                    HT_REPORT_ID: string
                    created_at: string
                    HT_PROFILE_ID: string
                    HT_STOCK_ID: string
                    HT_CONTENT: string
                }
                Insert: {
                    HT_REPORT_ID?: string
                    created_at?: string
                    HT_PROFILE_ID: string
                    HT_STOCK_ID: string
                    HT_CONTENT: string
                }
                Update: {
                    HT_REPORT_ID?: string
                    created_at?: string
                    HT_PROFILE_ID?: string
                    HT_STOCK_ID?: string
                    HT_CONTENT?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "HT_REPORT_HT_STOCK_ID_fkey"
                        columns: ["HT_STOCK_ID"]
                        isOneToOne: false
                        referencedRelation: "HT_STOCK"
                        referencedColumns: ["HT_STOCK_ID"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
