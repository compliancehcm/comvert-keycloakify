/* Máscara de CPF do campo de usuário (atributo `cvt.usernameMask = cpf`).

   O usuário do candidato no Keycloak é o CPF só com dígitos: a máscara existe só
   para a leitura na tela, e o formulário envia os dígitos (ver Login.tsx). */

/** Só os dígitos, até 11. */
export function digitosDoCpf(valor: string): string {
    return valor.replace(/\D/g, "").slice(0, 11);
}

/** "52998224725" -> "529.982.247-25"; parcial enquanto digita ("5299" -> "529.9"). */
export function formatarCpf(valor: string): string {
    const d = digitosDoCpf(valor);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
