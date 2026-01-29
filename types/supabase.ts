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
            HT_PROFILE: {
                Row: {
                    HT_PROFILE_ID: string
                    HT_NICKNAME: string | null
                    HT_AVATAR_URL: string | null
                    HT_CREATED_AT: string
                }
                Insert: {
                    HT_PROFILE_ID: string
                    HT_NICKNAME?: string | null
                    HT_AVATAR_URL?: string | null
                    HT_CREATED_AT?: string
                }
                Update: {
                    HT_PROFILE_ID?: string
                    HT_NICKNAME?: string | null
                    HT_AVATAR_URL?: string | null
                    HT_CREATED_AT?: string
                }
            }
            HT_STOCK: {
                Row: {
                    HT_STOCK_ID: string
                    HT_PROFILE_ID: string
                    HT_NAME: string
                    HT_TICKER: string | null
                    HT_CREATED_AT: string
                }
                Insert: {
                    HT_STOCK_ID?: string
                    HT_PROFILE_ID: string
                    HT_NAME: string
                    HT_TICKER?: string | null
                    HT_CREATED_AT?: string
                }
                Update: {
                    HT_STOCK_ID?: string
                    HT_PROFILE_ID?: string
                    HT_NAME?: string
                    HT_TICKER?: string | null
                    HT_CREATED_AT?: string
                }
            }
            HT_REPORT: {
                Row: {
                    HT_REPORT_ID: string
                    HT_STOCK_ID: string
                    HT_CONTENT: string
                    HT_CREATED_AT: string
                }
                Insert: {
                    HT_REPORT_ID?: string
                    HT_STOCK_ID: string
                    HT_CONTENT: string
                    HT_CREATED_AT?: string
                }
                Update: {
                    HT_REPORT_ID?: string
                    HT_STOCK_ID?: string
                    HT_CONTENT?: string
                    HT_CREATED_AT?: string
                }
            }
        }
    }
}
