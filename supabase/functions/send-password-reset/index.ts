import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  senderRole: string;
  senderName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, senderRole, senderName }: PasswordResetRequest = await req.json();

    console.log(`Password reset request for ${email} by ${senderRole}`);

    // Vérifier que l'email existe dans la base de données
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error("User not found:", profileError);
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Générer un lien de réinitialisation via Supabase Auth
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/login`
      }
    });

    if (resetError || !resetData.properties?.action_link) {
      console.error("Error generating reset link:", resetError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la génération du lien de réinitialisation" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resetLink = resetData.properties.action_link;
    
    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: "Anthea <noreply@infos.anthea-emploi-tracker.fr>",
      to: [email],
      subject: "Réinitialisation de votre mot de passe - Anthea",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Réinitialisation de mot de passe</h1>
          
          <p>Bonjour ${profile.full_name || email},</p>
          
          <p>Un ${senderRole === 'admin' ? 'administrateur' : 'consultant'} ${senderName ? `(${senderName})` : ''} a demandé la réinitialisation de votre mot de passe pour votre compte Anthea.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Ce lien est valide pendant 24 heures. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${resetLink}" style="color: #4F46E5; word-break: break-all;">${resetLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Cet email a été envoyé par l'équipe Anthea
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de réinitialisation envoyé avec succès"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur lors de l'envoi de l'email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);