import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import { useNotificationStore } from "./notifications";
import type { ShopItem } from "../types";

export const useShopStore = defineStore("shop", () => {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  const shopItems = ref<ShopItem[]>([
    {
      id: "coins-100",
      name: "100 Monedas",
      type: "upgrade",
      cost: 2.99,
      costType: "premium",
      rarity: "common",
      description: "Paquete básico de monedas",
      emoji: "🪙",
      available: true,
    },
    {
      id: "coins-500",
      name: "500 Monedas",
      type: "upgrade",
      cost: 9.99,
      costType: "premium",
      rarity: "rare",
      description: "Paquete premium de monedas",
      emoji: "💰",
      available: true,
    },
    {
      id: "coins-1000",
      name: "1000 Monedas",
      type: "upgrade",
      cost: 19.99,
      costType: "premium",
      rarity: "epic",
      description: "Paquete épico de monedas",
      emoji: "🏆",
      available: true,
    },
    {
      id: "premium-theme",
      name: "Tema Premium",
      type: "decoration",
      cost: 14.99,
      costType: "premium",
      rarity: "epic",
      description: "Desbloquea temas exclusivos",
      emoji: "🎨",
      available: true,
    },
  ]);

  const purchaseWithCoins = async (itemId: string) => {
    const item = shopItems.value.find((i) => i.id === itemId);
    if (!item || item.costType !== "coins" || !authStore.currentUser) {
      return false;
    }

    if (authStore.currentUser.coins < item.cost) {
      notificationStore.addNotification({
        title: "Monedas insuficientes",
        message: `Necesitas ${item.cost} monedas para comprar ${item.name}`,
        type: "warning",
      });
      return false;
    }

    try {
      await authStore.updateCoins(-item.cost);
      notificationStore.addNotification({
        title: "¡Compra exitosa!",
        message: `Has comprado ${item.name}`,
        type: "success",
      });
      return true;
    } catch (error) {
      notificationStore.addNotification({
        title: "Error en la compra",
        message: "No se pudo completar la transacción",
        type: "error",
      });
      return false;
    }
  };

  /*   const purchaseWithPayPal = (item: ShopItem): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (typeof window.paypal === "undefined") {
        notificationStore.addNotification({
          title: "Error",
          message: "PayPal no está disponible",
          type: "error",
        });
        reject(false);
        return;
      }

      // Crear botón de PayPal dinámicamente
      const container = document.createElement("div");
      container.id = "paypal-button-container-" + Date.now();
      document.body.appendChild(container);

      window.paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: item.cost.toString(),
                  },
                  description: item.name,
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();

              // Procesar la compra exitosa
              if (item.id.includes("coins")) {
                const coinAmount = parseInt(item.id.split("-")[1]);
                await authStore.updateCoins(coinAmount);
              }

              notificationStore.addNotification({
                title: "¡Compra exitosa!",
                message: `Has comprado ${item.name} con PayPal`,
                type: "success",
              });

              document.body.removeChild(container);
              resolve(true);
            } catch (error) {
              notificationStore.addNotification({
                title: "Error en el pago",
                message: "No se pudo procesar el pago",
                type: "error",
              });
              document.body.removeChild(container);
              reject(false);
            }
          },
          onError: (err: any) => {
            notificationStore.addNotification({
              title: "Error de PayPal",
              message: "Ocurrió un error al procesar el pago",
              type: "error",
            });
            document.body.removeChild(container);
            reject(false);
          },
        })
        .render(container);

      // Simular click en el botón después de un momento
      setTimeout(() => {
        const button = container.querySelector("iframe");
        if (button) {
          button.click();
        }
      }, 1000);
    });
  }; */

  return {
    shopItems,
    purchaseWithCoins,
    /* purchaseWithPayPal, */
  };
});
