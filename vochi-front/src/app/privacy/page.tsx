import { NavbarPublic } from "@/components/NavbarPublic";
import FooterVochi from "../(landing)/_components/FooterVochi";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarPublic />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Política de Privacidad
          </h1>

          <p className="text-sm text-muted-foreground mb-12">
            Última actualización: Marzo 2026
          </p>

          <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Introducción
              </h2>
              <p>
                Vochi es un simulador de entrevistas por voz con inteligencia
                artificial diseñado para ayudar a desarrolladores a practicar
                entrevistas técnicas y de recursos humanos.
              </p>
              <p className="mt-2">
                Esta política describe cómo recopilamos, usamos y protegemos tu
                información.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Información que recopilamos
              </h2>

              <ul className="space-y-3">
                <li>
                  <span className="text-foreground font-medium">
                    Información de cuenta:
                  </span>{" "}
                  email, nombre e imagen (si aplica).
                </li>

                <li>
                  <span className="text-foreground font-medium">
                    Contenido de entrevistas:
                  </span>{" "}
                  descripciones de trabajo, respuestas del usuario, mensajes y
                  feedback generado.
                </li>

                <li>
                  <span className="text-foreground font-medium">Audio:</span> no
                  almacenamos grabaciones de audio.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Uso de la información
              </h2>
              <ul className="space-y-3">
                <li>Proveer la simulación de entrevistas</li>
                <li>Generar feedback personalizado</li>
                <li>Mejorar la experiencia del producto</li>
                <li>Analizar uso general mediante analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Servicios de terceros
              </h2>
              <p>Utilizamos servicios externos para operar la aplicación:</p>
              <ul className="mt-3 space-y-3">
                <li>Servicios de inteligencia artificial</li>
                <li>Firebase (autenticación y analytics)</li>
                <li>Infraestructura de hosting (CubePath)</li>
              </ul>
              <p className="mt-3">
                Estos servicios pueden procesar datos exclusivamente para
                brindar funcionalidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Almacenamiento y retención
              </h2>
              <p>
                Guardamos transcripciones, feedback e información de cuenta para
                el funcionamiento del servicio.
              </p>
              <p className="mt-2">
                Actualmente, los usuarios no pueden eliminar sus datos de forma
                autónoma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Seguridad
              </h2>
              <p>
                Implementamos medidas razonables para proteger la información,
                aunque ningún sistema es completamente seguro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Usuarios internacionales
              </h2>
              <p>
                Al usar Vochi, aceptás que tus datos puedan ser procesados en
                servidores ubicados fuera de tu país.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Cambios en esta política
              </h2>
              <p>Podemos actualizar esta política en cualquier momento.</p>
            </section>
          </div>
        </div>
      </main>

      <FooterVochi />
    </div>
  );
}
