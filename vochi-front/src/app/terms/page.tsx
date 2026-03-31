import { NavbarPublic } from "@/components/NavbarPublic";
import FooterVochi from "../(landing)/_components/FooterVochi";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarPublic />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Términos y Condiciones
          </h1>

          <p className="text-sm text-muted-foreground mb-12">
            Última actualización: Marzo 2026
          </p>

          <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Uso del servicio
              </h2>
              <p>
                Vochi es una herramienta diseñada para la práctica de
                entrevistas laborales mediante inteligencia artificial.
              </p>
              <p className="mt-2">
                El servicio es únicamente con fines educativos y de práctica. No
                garantizamos resultados reales en procesos de selección laboral.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Naturaleza del servicio
              </h2>
              <p>
                Vochi utiliza inteligencia artificial para generar preguntas y
                feedback. Las respuestas generadas pueden contener errores,
                imprecisiones o interpretaciones incorrectas.
              </p>
              <p className="mt-2">
                El feedback proporcionado debe considerarse orientativo y no
                profesional.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Cuentas de usuario
              </h2>
              <p>
                Para utilizar ciertas funcionalidades, es necesario crear una
                cuenta.
              </p>
              <p className="mt-2">
                Nos reservamos el derecho de suspender o eliminar cuentas en
                caso de uso indebido del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Contenido del usuario
              </h2>
              <p>
                El usuario es responsable del contenido que genera dentro de la
                plataforma, incluyendo respuestas, mensajes y datos ingresados.
              </p>
              <p className="mt-2">
                Vochi no se hace responsable por el contenido proporcionado por
                los usuarios.
              </p>
              <p className="mt-2">
                El contenido generado no será utilizado fuera del contexto de la
                aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Uso aceptable
              </h2>
              <p>No está permitido:</p>
              <ul className="mt-3 space-y-2">
                <li>Usar la plataforma con fines ilegales</li>
                <li>Intentar abusar o explotar el sistema</li>
                <li>Generar contenido ofensivo o inapropiado</li>
                <li>Interferir con el funcionamiento del servicio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Disponibilidad del servicio
              </h2>
              <p>
                No garantizamos que el servicio esté disponible de forma
                continua o libre de errores.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Cambios en el servicio
              </h2>
              <p>
                Nos reservamos el derecho de modificar o interrumpir el servicio
                en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Modelo de negocio
              </h2>
              <p>
                Actualmente, Vochi es un servicio gratuito. En el futuro,
                algunas funcionalidades podrían ser de pago.
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterVochi />
    </div>
  );
}
